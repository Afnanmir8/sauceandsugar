/**
 * Pure TypeScript QR Code Generator (ISO/IEC 18004 Standard)
 * Zero external dependencies, 100% offline, client-side vector SVG rendering.
 * Based on Kazuhiko Arase's MIT-licensed QR code generator.
 */

// Error Correction Levels: L (7%), M (15%), Q (25%), H (30%)
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const EC_LEVEL_MAP: Record<ErrorCorrectionLevel, number> = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
};

// Galois Field GF(256) math
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);

for (let i = 0, x = 1; i < 255; i++) {
  EXP_TABLE[i] = x;
  LOG_TABLE[x] = i;
  x <<= 1;
  if (x & 0x100) {
    x ^= 0x11d; // Primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
  }
}
EXP_TABLE[255] = EXP_TABLE[0];

function glog(n: number): number {
  if (n < 1) throw new Error(`glog(${n}) error`);
  return LOG_TABLE[n];
}

function gexp(n: number): number {
  while (n < 0) n += 255;
  while (n >= 255) n -= 255;
  return EXP_TABLE[n];
}

// Polynomial operations in GF(256)
class QRPolynomial {
  num: number[];

  constructor(num: number[], shift = 0) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) {
      offset++;
    }
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[i + offset];
    }
    for (let i = num.length - offset; i < this.num.length; i++) {
      this.num[i] = 0;
    }
  }

  get(index: number): number {
    return this.num[index];
  }

  getLength(): number {
    return this.num.length;
  }

  multiply(e: QRPolynomial): QRPolynomial {
    const num = new Array(this.getLength() + e.getLength() - 1).fill(0);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= gexp(glog(this.get(i)) + glog(e.get(j)));
      }
    }
    return new QRPolynomial(num);
  }

  mod(e: QRPolynomial): QRPolynomial {
    if (this.getLength() - e.getLength() < 0) {
      return this;
    }
    const ratio = glog(this.get(0)) - glog(e.get(0));
    const num = new Array(this.getLength());
    for (let i = 0; i < this.getLength(); i++) {
      num[i] = this.get(i);
    }
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= gexp(glog(e.get(i)) + ratio);
    }
    return new QRPolynomial(num).mod(e);
  }
}

// QR RS Block information [totalCount, dataCount]
interface QRRSBlockInfo {
  totalCount: number;
  dataCount: number;
}

const RS_BLOCK_TABLE: number[][][] = [
  // Version 1
  [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9]],
  // Version 2
  [[1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16]],
  // Version 3
  [[1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13]],
  // Version 4
  [[1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9]],
  // Version 5
  [[1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12]],
  // Version 6
  [[2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15]],
  // Version 7
  [[2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14]],
  // Version 8
  [[2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15]],
  // Version 9
  [[2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13]],
  // Version 10
  [[2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16]],
  // Version 11
  [[4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13]],
  // Version 12
  [[2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15]],
  // Version 13
  [[4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12]],
  // Version 14
  [[3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13]],
];

function getRSBlocks(version: number, errorCorrectionLevel: ErrorCorrectionLevel): QRRSBlockInfo[] {
  const ecIndex = EC_LEVEL_MAP[errorCorrectionLevel];
  const table = RS_BLOCK_TABLE[version - 1]?.[ecIndex];
  if (!table) throw new Error(`Bad RS block for version ${version}, level ${errorCorrectionLevel}`);
  const list: QRRSBlockInfo[] = [];
  for (let i = 0; i < table.length; i += 3) {
    const count = table[i];
    const totalCount = table[i + 1];
    const dataCount = table[i + 2];
    for (let j = 0; j < count; j++) {
      list.push({ totalCount, dataCount });
    }
  }
  return list;
}

// Alignment Pattern Positions
const ALIGNMENT_PATTERN_TABLE: number[][] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
];

// Bit Buffer
class QRBitBuffer {
  buffer: number[] = [];
  length = 0;

  get(index: number): boolean {
    const bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1;
  }

  put(num: number, length: number) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }
}

// 8-bit Byte Mode data
class QR8BitByte {
  mode = 4; // 8-bit byte mode
  data: Uint8Array;

  constructor(dataStr: string) {
    // UTF-8 encode
    const encoder = new TextEncoder();
    this.data = encoder.encode(dataStr);
  }

  getLength(): number {
    return this.data.length;
  }

  write(buffer: QRBitBuffer) {
    for (let i = 0; i < this.data.length; i++) {
      buffer.put(this.data[i], 8);
    }
  }
}

// Error correction generator polynomial
function getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial {
  let a = new QRPolynomial([1], 0);
  for (let i = 0; i < errorCorrectLength; i++) {
    a = a.multiply(new QRPolynomial([1, gexp(i)], 0));
  }
  return a;
}

// Mask evaluation penalty scores
function getLostPoint(modules: (boolean | null)[][]): number {
  const moduleCount = modules.length;
  let lostPoint = 0;

  // Level 1: 5 or more same color modules in row/col
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      let sameCount = 0;
      const dark = modules[row][col];
      for (let r = -1; r <= 1; r++) {
        if (row + r < 0 || moduleCount <= row + r) continue;
        for (let c = -1; c <= 1; c++) {
          if (col + c < 0 || moduleCount <= col + c) continue;
          if (r === 0 && c === 0) continue;
          if (dark === modules[row + r][col + c]) sameCount++;
        }
      }
      if (sameCount > 5) lostPoint += 3 + sameCount - 5;
    }
  }

  // Level 2: 2x2 blocks of same color
  for (let row = 0; row < moduleCount - 1; row++) {
    for (let col = 0; col < moduleCount - 1; col++) {
      let count = 0;
      if (modules[row][col]) count++;
      if (modules[row + 1][col]) count++;
      if (modules[row][col + 1]) count++;
      if (modules[row + 1][col + 1]) count++;
      if (count === 0 || count === 4) lostPoint += 3;
    }
  }

  return lostPoint;
}

function getMask(maskPattern: number, i: number, j: number): boolean {
  switch (maskPattern) {
    case 0: return (i + j) % 2 === 0;
    case 1: return i % 2 === 0;
    case 2: return j % 3 === 0;
    case 3: return (i + j) % 3 === 0;
    case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case 5: return ((i * j) % 2) + ((i * j) % 3) === 0;
    case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
    case 7: return (((i + j) % 2) + ((i * j) % 3)) % 2 === 0;
    default: throw new Error(`Bad maskPattern: ${maskPattern}`);
  }
}

// QR Code Model
export class QRCodeModel {
  typeNumber: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  modules: (boolean | null)[][] = [];
  moduleCount = 0;
  dataList: QR8BitByte[] = [];

  constructor(typeNumber: number, errorCorrectionLevel: ErrorCorrectionLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectionLevel = errorCorrectionLevel;
  }

  addData(data: string) {
    this.dataList.push(new QR8BitByte(data));
  }

  isDark(row: number, col: number): boolean {
    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
      return false;
    }
    return this.modules[row][col] === true;
  }

  make() {
    let bestMaskPattern = 0;
    let minLostPoint = 1e9;

    this.makeImpl(false, 0);

    for (let i = 0; i < 8; i++) {
      this.makeImpl(true, i);
      const lostPoint = getLostPoint(this.modules);
      if (lostPoint < minLostPoint) {
        minLostPoint = lostPoint;
        bestMaskPattern = i;
      }
    }

    this.makeImpl(false, bestMaskPattern);
  }

  private makeImpl(test: boolean, maskPattern: number) {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = new Array(this.moduleCount);
    for (let row = 0; row < this.moduleCount; row++) {
      this.modules[row] = new Array(this.moduleCount).fill(null);
    }

    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);

    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }

    const data = QRCodeModel.createData(this.typeNumber, this.errorCorrectionLevel, this.dataList);
    this.mapData(data, maskPattern);
  }

  private setupPositionProbePattern(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  private setupTimingPattern() {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] !== null) continue;
      this.modules[r][6] = r % 2 === 0;
    }
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] !== null) continue;
      this.modules[6][c] = c % 2 === 0;
    }
  }

  private setupPositionAdjustPattern() {
    const pos = ALIGNMENT_PATTERN_TABLE[this.typeNumber - 1];
    if (!pos) return;
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i];
        const col = pos[j];
        if (this.modules[row][col] !== null) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  private setupTypeNumber(test: boolean) {
    const bits = getBCHTypeNumber(this.typeNumber);
    for (let i = 0; i < 18; i++) {
      const mod = !test && ((bits >> i) & 1) === 1;
      this.modules[Math.floor(i / 3)][(i % 3) + this.moduleCount - 8 - 3] = mod;
      this.modules[(i % 3) + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  }

  private setupTypeInfo(test: boolean, maskPattern: number) {
    const data = (EC_LEVEL_MAP[this.errorCorrectionLevel] << 3) | maskPattern;
    const bits = getBCHTypeInfo(data);

    // Vertical
    for (let i = 0; i < 15; i++) {
      const mod = !test && ((bits >> i) & 1) === 1;
      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }

    // Horizontal
    for (let i = 0; i < 15; i++) {
      const mod = !test && ((bits >> i) & 1) === 1;
      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }

    // Fixed dark module
    this.modules[this.moduleCount - 8][8] = !test;
  }

  private mapData(data: number[], maskPattern: number) {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;

    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--; // Skip vertical timing column
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (this.modules[row][col - c] === null) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            }
            const mask = getMask(maskPattern, row, col - c);
            if (mask) dark = !dark;
            this.modules[row][col - c] = dark;
            bitIndex--;
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  private static createData(version: number, errorCorrectionLevel: ErrorCorrectionLevel, dataList: QR8BitByte[]): number[] {
    const rsBlocks = getRSBlocks(version, errorCorrectionLevel);
    const buffer = new QRBitBuffer();

    for (let i = 0; i < dataList.length; i++) {
      const data = dataList[i];
      buffer.put(data.mode, 4);
      // Byte mode character count indicator: 8 bits for versions 1-9, 16 bits for version >= 10
      buffer.put(data.getLength(), version < 10 ? 8 : 16);
      data.write(buffer);
    }

    // Total data capacity in bits
    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i].dataCount;
    }

    if (buffer.length + 4 <= totalDataCount * 8) {
      buffer.put(0, 4); // Terminator
    }

    // Padding to byte boundary
    while (buffer.length % 8 !== 0) {
      buffer.putBit(false);
    }

    // Pad bytes
    while (buffer.length < totalDataCount * 8) {
      buffer.put(0xec, 8);
      if (buffer.length >= totalDataCount * 8) break;
      buffer.put(0x11, 8);
    }

    return QRCodeModel.createBytes(buffer, rsBlocks);
  }

  private static createBytes(buffer: QRBitBuffer, rsBlocks: QRRSBlockInfo[]): number[] {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;

    const dcdata: number[][] = new Array(rsBlocks.length);
    const ecdata: number[][] = new Array(rsBlocks.length);

    for (let r = 0; r < rsBlocks.length; r++) {
      const dcCount = rsBlocks[r].dataCount;
      const ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);

      dcdata[r] = new Array(dcCount);
      for (let i = 0; i < dcdata[r].length; i++) {
        dcdata[r][i] = 0xff & buffer.buffer[i + offset];
      }
      offset += dcCount;

      const rsPoly = getErrorCorrectPolynomial(ecCount);
      const rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
      const modPoly = rawPoly.mod(rsPoly);

      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (let i = 0; i < ecdata[r].length; i++) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
      }
    }

    const data: number[] = [];
    // Interleave data codewords
    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) {
          data.push(dcdata[r][i]);
        }
      }
    }

    // Interleave error correction codewords
    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) {
          data.push(ecdata[r][i]);
        }
      }
    }

    return data;
  }
}

// BCH calculations
const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | 1;
const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | 1;
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

function getBCHDigit(data: number): number {
  let digit = 0;
  while (data !== 0) {
    digit++;
    data >>>= 1;
  }
  return digit;
}

function getBCHTypeInfo(data: number): number {
  let d = data << 10;
  while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
    d ^= G15 << (getBCHDigit(d) - getBCHDigit(G15));
  }
  return ((data << 10) | d) ^ G15_MASK;
}

function getBCHTypeNumber(data: number): number {
  let d = data << 12;
  while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
    d ^= G18 << (getBCHDigit(d) - getBCHDigit(G18));
  }
  return (data << 12) | d;
}

/**
 * Generate a 2D boolean matrix of the QR Code for any text string.
 * Automatically chooses the best version (1-14) based on data size and error correction.
 */
export function generateQRCodeMatrix(
  text: string,
  errorCorrectionLevel: ErrorCorrectionLevel = 'M'
): boolean[][] {
  const encoder = new TextEncoder();
  const byteLength = encoder.encode(text).length;

  // Auto select minimum version capable of holding the data
  let selectedVersion = 1;
  for (let v = 1; v <= 14; v++) {
    const blocks = getRSBlocks(v, errorCorrectionLevel);
    let totalData = 0;
    for (const b of blocks) totalData += b.dataCount;
    // Overhead: mode (4 bits) + char count (8 or 16 bits)
    const headerBits = 4 + (v < 10 ? 8 : 16);
    if ((byteLength * 8 + headerBits) <= totalData * 8) {
      selectedVersion = v;
      break;
    }
    if (v === 14) selectedVersion = 14;
  }

  const qr = new QRCodeModel(selectedVersion, errorCorrectionLevel);
  qr.addData(text);
  qr.make();

  const matrix: boolean[][] = [];
  for (let r = 0; r < qr.moduleCount; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < qr.moduleCount; c++) {
      row.push(qr.isDark(r, c));
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Generate SVG path data string combining all dark modules into a single optimized path.
 * This makes rendering lightning-fast with minimal DOM nodes.
 */
export function qrMatrixToSvgPath(matrix: boolean[][]): { path: string; size: number } {
  const size = matrix.length;
  let path = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        path += `M${c},${r}h1v1h-1z `;
      }
    }
  }
  return { path, size };
}
