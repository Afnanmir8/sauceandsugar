export type Category = "pockets" | "fancy" | "classics" | "goodies" | "addons" | "sugar";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  mrp?: number;
  desc: string;
  longDesc: string;
  image: string;
  serves: string;
  portion: string;
  tag?: "BESTSELLER" | "LIMITED BATCH" | "THIS WEEK" | "ALMOST SOLD OUT" | "NEW" | "CHEF'S PICK";
  stockLeft: number;
  totalBatch: number;
  soldOut?: boolean;
  veg: boolean;
  spice?: "Mild" | "Medium" | "Spicy";
  ingredients: string[];
  allergens: string[];
  prep: string;
  rating: number;
  orders: string;
  customOptions?: { label: string; choices: string[] }[];
  addons?: { label: string; price: number }[];
}

const LEGACY_PRODUCTS = [
  {
    id: "alfredo",
    name: "Creamy Alfredo Pasta",
    category: "pasta",
    price: 249,
    mrp: 299,
    desc: "Silky creamy sauce tossed with freshly prepared pasta, finished with herbs & parmesan.",
    longDesc:
      "Our most-loved bowl. A velvety parmesan-cream sauce slowly simmered with garlic butter, tossed through perfectly cooked penne and finished with cracked pepper, mixed herbs and a snowfall of parmesan. Comfort in every twirl.",
    image:
      "https://images.pexels.com/photos/11220209/pexels-photo-11220209.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    serves: "Serves 1",
    portion: "350g bowl • Penne",
    tag: "BESTSELLER",
    stockLeft: 14,
    totalBatch: 40,
    veg: true,
    spice: "Mild",
    ingredients: ["Penne pasta", "Fresh cream", "Parmesan", "Garlic butter", "Mixed herbs", "Cracked pepper"],
    allergens: ["Gluten", "Milk", "Dairy"],
    prep: "Made fresh this week • Cooked on dispatch day • Best enjoyed hot within 2 hrs",
    rating: 4.9,
    orders: "2.1k",
    customOptions: [
      { label: "Pasta shape", choices: ["Penne", "Fusilli", "Spaghetti"] },
      { label: "Spice level", choices: ["Mild", "Medium"] },
    ],
    addons: [
      { label: "Extra parmesan shower", price: 40 },
      { label: "Garlic bread (2 pc)", price: 60 },
      { label: "Exotic veggie boost", price: 50 },
    ],
  },
  {
    id: "pink-sauce",
    name: "Pink Sauce Pasta",
    category: "pasta",
    price: 259,
    mrp: 299,
    desc: "Blush tomato-cream sauce, basil & cheese — the Instagram favourite everyone reorders.",
    longDesc:
      "The best of both worlds — tangy San Marzano-style tomatoes folded into fresh cream with basil, garlic and a generous cheese pull. Slightly sweet, rich, and blushing pink. Kids and adults both obsess over this one.",
    image:
      "https://images.pexels.com/photos/14930717/pexels-photo-14930717.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    serves: "Serves 1",
    portion: "350g bowl • Penne",
    tag: "THIS WEEK",
    stockLeft: 11,
    totalBatch: 35,
    veg: true,
    spice: "Medium",
    ingredients: ["Penne", "Tomato passata", "Fresh cream", "Basil", "Mozzarella", "Garlic"],
    allergens: ["Gluten", "Milk"],
    prep: "Made fresh this week • Sauce simmered 2 hrs • Best enjoyed hot",
    rating: 4.8,
    orders: "1.8k",
    customOptions: [
      { label: "Pasta shape", choices: ["Penne", "Fusilli"] },
      { label: "Cheese level", choices: ["Classic", "Extra cheesy (+₹30)"] },
    ],
    addons: [
      { label: "Extra cheese", price: 30 },
      { label: "Garlic bread (2 pc)", price: 60 },
    ],
  },
  {
    id: "arrabbiata",
    name: "Arrabbiata Pasta",
    category: "pasta",
    price: 229,
    desc: "Fiery slow-cooked tomato, garlic & chilli — bold, tangy and unapologetically spicy.",
    longDesc:
      "For the spice lovers. Slow-cooked tomatoes, lots of garlic, dried red chillies and olive oil tossed with al-dente pasta. Finished with fresh basil. Simple, fiery, Roman-style soul food.",
    image:
      "https://images.pexels.com/photos/5317180/pexels-photo-5317180.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    serves: "Serves 1",
    portion: "340g bowl • Penne",
    stockLeft: 18,
    totalBatch: 30,
    veg: true,
    spice: "Spicy",
    ingredients: ["Penne", "Tomatoes", "Garlic", "Dried red chilli", "Olive oil", "Basil"],
    allergens: ["Gluten"],
    prep: "Made fresh this week • Vegan-friendly base • Best enjoyed hot",
    rating: 4.7,
    orders: "1.2k",
    customOptions: [{ label: "Spice level", choices: ["Medium", "Spicy", "Extra spicy"] }],
    addons: [{ label: "Garlic bread (2 pc)", price: 60 }],
  },
  {
    id: "pesto",
    name: "Pesto Pasta",
    category: "pasta",
    price: 279,
    desc: "Fresh basil pesto, toasted nuts, olive oil & parmesan — bright, herby, premium.",
    longDesc:
      "Pounded fresh every batch-day. Fragrant basil, toasted cashews & pine nuts, cold-pressed olive oil and aged parmesan, tossed through pasta with a splash of pasta water for gloss. Our most aromatic bowl.",
    image:
      "https://images.pexels.com/photos/30910495/pexels-photo-30910495.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    serves: "Serves 1",
    portion: "330g bowl • Choice of shape",
    tag: "LIMITED BATCH",
    stockLeft: 6,
    totalBatch: 20,
    veg: true,
    spice: "Mild",
    ingredients: ["Basil", "Cashew & pine nuts", "Olive oil", "Parmesan", "Garlic", "Pasta"],
    allergens: ["Gluten", "Nuts", "Milk"],
    prep: "Pesto pounded fresh on dispatch morning • Contains nuts",
    rating: 4.9,
    orders: "980",
    customOptions: [{ label: "Pasta shape", choices: ["Penne", "Spaghetti", "Fusilli"] }],
    addons: [
      { label: "Extra pesto drizzle", price: 50 },
      { label: "Extra parmesan", price: 40 },
    ],
  },
  {
    id: "truffle-cream",
    name: "Truffle Cream Pasta",
    category: "pasta",
    price: 349,
    mrp: 399,
    desc: "Luxurious mushroom-truffle cream — our limited luxury bowl for true indulgence.",
    longDesc:
      "Small-batch luxury. Earthy mushrooms folded into a truffle-scented cream with parmesan and a whisper of butter. Finished with herbs. Only 15 bowls make it each week — when it's gone, it's gone.",
    image:
      "https://images.pexels.com/photos/2703468/pexels-photo-2703468.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    serves: "Serves 1",
    portion: "350g bowl • Spaghetti",
    tag: "ALMOST SOLD OUT",
    stockLeft: 3,
    totalBatch: 15,
    veg: true,
    spice: "Mild",
    ingredients: ["Spaghetti", "Mushroom", "Truffle oil", "Cream", "Parmesan", "Butter herbs"],
    allergens: ["Gluten", "Milk"],
    prep: "Only 15 portions per week • Made fresh on dispatch day",
    rating: 5.0,
    orders: "640",
    customOptions: [{ label: "Pasta shape", choices: ["Spaghetti", "Penne"] }],
    addons: [{ label: "Extra mushroom", price: 60 }],
  },
  {
    id: "lasagna",
    name: "Classic Veg Lasagna",
    category: "pasta",
    price: 299,
    desc: "Layered pasta sheets, rich ragù, béchamel & a golden cheese crust. Baked to order.",
    longDesc:
      "Layers of joy. Tender pasta sheets stacked with slow-cooked vegetable ragù, creamy béchamel and mozzarella, baked till bubbling and golden. Served in its own bake-friendly tray — hearty enough to share (or not).",
    image:
      "https://images.pexels.com/photos/33312938/pexels-photo-33312938.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    serves: "Serves 1–2",
    portion: "450g bake • Single tray",
    tag: "CHEF'S PICK",
    stockLeft: 9,
    totalBatch: 25,
    veg: true,
    spice: "Medium",
    ingredients: ["Lasagna sheets", "Veg ragù", "Béchamel", "Mozzarella", "Tomato", "Herbs"],
    allergens: ["Gluten", "Milk"],
    prep: "Baked fresh on dispatch day • Reheats beautifully in 8 mins",
    rating: 4.8,
    orders: "1.1k",
    customOptions: [{ label: "Portion", choices: ["Single (450g)", "Family (900g +₹280)"] }],
    addons: [{ label: "Extra cheese crust", price: 50 }],
  },
  {
    id: "ravioli",
    name: "Cheese & Herb Ravioli",
    category: "pasta",
    price: 329,
    desc: "Hand-folded pillows stuffed with cheese & herbs, tossed in butter-sage sauce.",
    longDesc:
      "Handmade, hand-folded. Delicate pasta pillows stuffed with ricotta, mozzarella and herbs, tossed in burnt butter-sage with toasted nuts and parmesan. The most artisanal thing we make — limited folds per week.",
    image:
      "https://images.pexels.com/photos/36999963/pexels-photo-36999963.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    serves: "Serves 1",
    portion: "8 pc • Butter-sage",
    tag: "LIMITED BATCH",
    stockLeft: 7,
    totalBatch: 18,
    veg: true,
    spice: "Mild",
    ingredients: ["Fresh pasta dough", "Ricotta", "Mozzarella", "Sage butter", "Nuts", "Parmesan"],
    allergens: ["Gluten", "Milk", "Nuts"],
    prep: "Folded by hand • 8 pieces per portion • Extremely limited",
    rating: 4.9,
    orders: "520",
    customOptions: [{ label: "Sauce", choices: ["Butter-sage", "Pink sauce", "Alfredo"] }],
    addons: [{ label: "Extra parmesan", price: 40 }],
  },
  {
    id: "baked-pasta",
    name: "Cheesy Baked Pasta",
    category: "pasta",
    price: 269,
    desc: "Creamy mixed-sauce pasta baked with a molten mozzarella top. Pure comfort.",
    longDesc:
      "The crowd-pleaser. Penne folded through a creamy tomato-cheese sauce with veggies, topped with mozzarella and baked till molten and spotted golden. Comes bubbling in its tray.",
    image:
      "https://images.pexels.com/photos/5949903/pexels-photo-5949903.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    serves: "Serves 1–2",
    portion: "420g bake",
    stockLeft: 12,
    totalBatch: 28,
    veg: true,
    spice: "Medium",
    ingredients: ["Penne", "Tomato-cream sauce", "Veggies", "Mozzarella", "Herbs"],
    allergens: ["Gluten", "Milk"],
    prep: "Baked to order on dispatch day • Best eaten hot",
    rating: 4.7,
    orders: "890",
    customOptions: [{ label: "Sauce mix", choices: ["Classic mix", "Only white", "Only red"] }],
    addons: [{ label: "Extra cheese top", price: 45 }],
  },
  {
    id: "tiramisu",
    name: "Classic Tiramisu",
    category: "dessert",
    price: 249,
    mrp: 289,
    desc: "Espresso-soaked savoiardi, mascarpone clouds & cocoa — Italy's icon, made fresh.",
    longDesc:
      "No shortcuts. Espresso-dipped savoiardi layered with whipped mascarpone cream and dusted with dark cocoa. Chilled overnight for that perfect spoon-soft set. Light, boozy-free, and deeply coffee-kissed.",
    image:
      "https://images.pexels.com/photos/26838690/pexels-photo-26838690.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    serves: "Serves 1",
    portion: "180g cup • Chilled",
    tag: "BESTSELLER",
    stockLeft: 10,
    totalBatch: 30,
    veg: true,
    ingredients: ["Savoiardi", "Espresso", "Mascarpone", "Cream", "Cocoa"],
    allergens: ["Gluten", "Milk", "Egg"],
    prep: "Set overnight • Keep refrigerated • Best within 2 days",
    rating: 4.9,
    orders: "1.9k",
    customOptions: [{ label: "Size", choices: ["Solo cup", "Duo box (+₹220)"] }],
    addons: [{ label: "Extra cocoa & shavings", price: 25 }],
  },
  {
    id: "choco-mousse",
    name: "Belgian Chocolate Mousse",
    category: "dessert",
    price: 199,
    desc: "Dark, airy, intense — 54% Belgian chocolate whipped into silk. Minimalist luxury.",
    longDesc:
      "Three ingredients, done right. Real Belgian couverture folded into softly whipped cream for an airy, intense, melt-on-tongue mousse. Topped with chocolate soil. For purists.",
    image:
      "https://images.pexels.com/photos/11287582/pexels-photo-11287582.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    serves: "Serves 1",
    portion: "150g glass jar",
    stockLeft: 16,
    totalBatch: 32,
    veg: true,
    ingredients: ["Belgian couverture 54%", "Cream", "Cocoa soil"],
    allergens: ["Milk", "Soy"],
    prep: "Chilled & set • Keep refrigerated",
    rating: 4.8,
    orders: "1.4k",
    customOptions: [{ label: "Intensity", choices: ["Classic dark", "Milk chocolate"] }],
    addons: [],
  },
  {
    id: "biscoff-cheesecake",
    name: "Biscoff Cheesecake",
    category: "dessert",
    price: 299,
    mrp: 349,
    desc: "Baked cheesecake on buttery Biscoff base with molten Biscoff drizzle. Cult favourite.",
    longDesc:
      "The one people DM us about. Buttery Lotus Biscoff crumb base, slow-baked vanilla cheesecake, crowned with molten Biscoff spread and crumbs. Caramelised, creamy, crunchy — all at once.",
    image:
      "https://images.pexels.com/photos/15911843/pexels-photo-15911843.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    serves: "Serves 1–2",
    portion: "220g slice • Chilled",
    tag: "BESTSELLER",
    stockLeft: 8,
    totalBatch: 24,
    veg: true,
    ingredients: ["Cream cheese", "Biscoff spread & biscuits", "Butter", "Cream", "Vanilla"],
    allergens: ["Gluten", "Milk", "Soy"],
    prep: "Baked & chilled 12 hrs • Keep refrigerated",
    rating: 5.0,
    orders: "1.6k",
    customOptions: [{ label: "Size", choices: ["Slice", "Mini tub (+₹120)"] }],
    addons: [{ label: "Extra Biscoff drizzle", price: 45 }],
  },
  {
    id: "brownie",
    name: "Fudgy Chocolate Brownie",
    category: "dessert",
    price: 179,
    desc: "Dense, fudgy-centered, crackle-topped brownies — baked fresh in small trays.",
    longDesc:
      "Crackle top, molten middle. Dark chocolate, real butter and brown sugar baked in small trays for maximum fudginess. Comes as 2 generous squares. Warm it 10 seconds — thank us later.",
    image:
      "https://images.pexels.com/photos/7021888/pexels-photo-7021888.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    serves: "Serves 1–2",
    portion: "2 pc • 180g box",
    stockLeft: 20,
    totalBatch: 40,
    veg: true,
    ingredients: ["Dark chocolate", "Butter", "Brown sugar", "Flour", "Cocoa", "Eggs"],
    allergens: ["Gluten", "Milk", "Egg"],
    prep: "Baked fresh dispatch morning • Keeps 4 days",
    rating: 4.8,
    orders: "2.3k",
    customOptions: [{ label: "Box", choices: ["Box of 2", "Box of 4 (+₹160)"] }],
    addons: [],
  },
  {
    id: "biscoff-cup",
    name: "Lotus Biscoff Dessert Cup",
    category: "dessert",
    price: 229,
    desc: "Layers of Biscoff mousse, crumbs & cheesecake cream in a grab-and-go cup.",
    longDesc:
      "Layers on layers. Biscoff mousse, crushed caramelised biscuits, cheesecake cream and a molten Biscoff heart — all in a cute cup built for the fridge-to-spoon moment.",
    image:
      "https://images.pexels.com/photos/15080943/pexels-photo-15080943.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    serves: "Serves 1",
    portion: "170g cup",
    tag: "NEW",
    stockLeft: 13,
    totalBatch: 30,
    veg: true,
    ingredients: ["Biscoff", "Cream cheese mousse", "Cream", "Biscuit crumb"],
    allergens: ["Gluten", "Milk"],
    prep: "Assembled fresh • Keep refrigerated",
    rating: 4.7,
    orders: "720",
    customOptions: [],
    addons: [{ label: "Extra Biscoff heart", price: 35 }],
  },
  {
    id: "red-velvet",
    name: "Red Velvet Dessert",
    category: "dessert",
    price: 239,
    desc: "Velvety crimson layers with tangy cream-cheese frosting — romantic & rich.",
    longDesc:
      "Dramatic and delicious. Moist crimson cocoa layers with silky cream-cheese frosting and red-velvet crumbs. Our most photogenic dessert — made for feeds and cravings alike.",
    image:
      "https://images.pexels.com/photos/35622247/pexels-photo-35622247.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    serves: "Serves 1–2",
    portion: "200g tub",
    tag: "THIS WEEK",
    stockLeft: 9,
    totalBatch: 22,
    veg: true,
    ingredients: ["Flour", "Cocoa", "Buttermilk", "Cream cheese", "Butter"],
    allergens: ["Gluten", "Milk", "Egg"],
    prep: "Frosted fresh • Keep refrigerated",
    rating: 4.8,
    orders: "860",
    customOptions: [],
    addons: [],
  },
  {
    id: "basque",
    name: "Burnt Basque Cheesecake",
    category: "dessert",
    price: 319,
    mrp: 359,
    desc: "Caramelised top, molten centre — the famous San Sebastián cheesecake, Ranchi-style.",
    longDesc:
      "Beautifully burnt. Baked hot for a deeply caramelised top and a custardy, molten centre. No base, no fuss — just pure cheesecake intensity. Serve at room temp for the perfect wobble.",
    image:
      "https://images.pexels.com/photos/7845536/pexels-photo-7845536.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    serves: "Serves 2",
    portion: "250g slice",
    tag: "LIMITED BATCH",
    stockLeft: 5,
    totalBatch: 16,
    veg: true,
    ingredients: ["Cream cheese", "Cream", "Eggs", "Sugar", "Vanilla"],
    allergens: ["Milk", "Egg", "Gluten (trace)"],
    prep: "Baked at high heat • Best at room temp • Very limited",
    rating: 4.9,
    orders: "480",
    customOptions: [],
    addons: [],
  },
  {
    id: "choc-tart",
    name: "Dark Chocolate Tart",
    category: "dessert",
    price: 279,
    desc: "Buttery cocoa shell, silky ganache & sea salt — crisp, glossy, grown-up chocolate.",
    longDesc:
      "Crisp shell, silk filling. Buttery cocoa shortcrust filled with glossy dark ganache and a flake of sea salt. Snappy, smooth, salty-sweet — the connoisseur's pick.",
    image:
      "https://images.pexels.com/photos/3851093/pexels-photo-3851093.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    serves: "Serves 1–2",
    portion: "4-inch tart",
    stockLeft: 0,
    totalBatch: 20,
    soldOut: true,
    veg: true,
    ingredients: ["Cocoa shell", "Dark ganache", "Butter", "Cream", "Sea salt"],
    allergens: ["Gluten", "Milk", "Egg"],
    prep: "Sold out this week • Back next batch",
    rating: 4.9,
    orders: "610",
    customOptions: [],
    addons: [],
  },
];

void LEGACY_PRODUCTS;

const menuImage = "https://images.pexels.com/photos/11220208/pexels-photo-11220208.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
const dessertImage = "https://images.pexels.com/photos/33419744/pexels-photo-33419744.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
const sauceOptions = ["Butter garlic", "Lemon butter", "Alfredo", "Arrabbiata", "Pesto", "Pink"];
const cottageCornRavioliImage = "/images/cottage cheese and corn ravioli.jpeg";
const caramelisedOnionRavioliImage = "/images/caramalised onion ravioli.jpeg";
const chickenCheeseRavioliImage = "/images/chicken and cheese ravioli.jpeg";
const eggCreamRavioliImage = "/images/egg and cream ravioli.jpeg";
const spaghettiImage = "/images/spaghetti.jpeg";
const fettuccineImage = "/images/fettuccine.jpeg";
const farfalleImage = "/images/farfalle.jpeg";
const penneImage = "/images/penne.jpeg";
const fusilliImage = "/images/fusilli.jpeg";
const macaroniImage = "/images/macaroni.jpeg";
const cottageAlfredoImage = "/images/cottage cheese alfredo.jpeg";
const highFibreMacaroniImage = "/images/high fibre macaroni.jpeg";
const tiramisuImage = "/images/tiramisu.png";
const tresLechesImage = "/images/tres-leches.jpeg";
const brownieImage = "/images/brownie.jpeg";
const fiveLayerDreamTubImage = "/images/5 layer dream tub.jpeg";
const pastaAddons = [
  { label: "Garlic bread (2 pc)", price: 59 },
  { label: "Cheese garlic bread (2 pc)", price: 79 },
  { label: "Extra cheese", price: 49 },
];

function menuProduct(id: string, name: string, category: Category, price: number, image = menuImage, customOptions?: Product["customOptions"]): Product {
  return {
    id, name, category, price, desc: "From the Sauce & Sugar illustrated menu.",
    longDesc: "Prepared fresh to order from this week's Sauce & Sugar menu.", image,
    serves: "Serves 1", portion: "Weekly batch", stockLeft: 20, totalBatch: 20,
    veg: true, ingredients: ["Fresh ingredients", "House-made sauce"], allergens: ["Please ask before ordering"],
    prep: "Prepared fresh on dispatch day", rating: 5, orders: "New", customOptions,
    addons: category === "sugar" ? [] : pastaAddons,
  };
}

export const PRODUCTS: Product[] = [
  menuProduct("cottage-corn-ravioli", "Cottage Cheese & Corn", "pockets", 199, cottageCornRavioliImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("caramelised-onion-ravioli", "Caramelised Onions", "pockets", 189, caramelisedOnionRavioliImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("chicken-cheese-ravioli", "Chicken & Cheese", "pockets", 229, chickenCheeseRavioliImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("egg-cream-ravioli", "Egg & Cream", "pockets", 219, eggCreamRavioliImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("spaghetti-veg", "Spaghetti - Veg", "fancy", 179, spaghettiImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("spaghetti-nonveg", "Spaghetti - Non-Veg", "fancy", 209, spaghettiImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("fettuccine-veg", "Fettuccine - Veg", "fancy", 189, fettuccineImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("fettuccine-nonveg", "Fettuccine - Non-Veg", "fancy", 219, fettuccineImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("farfalle-veg", "Farfalle - Veg", "fancy", 179, farfalleImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("farfalle-nonveg", "Farfalle - Non-Veg", "fancy", 209, farfalleImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("penne-veg", "Penne - Veg", "classics", 169, penneImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("penne-nonveg", "Penne - Non-Veg", "classics", 199, penneImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("fusilli-veg", "Fusilli - Veg", "classics", 179, fusilliImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("fusilli-nonveg", "Fusilli - Non-Veg", "classics", 209, fusilliImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("macaroni-veg", "Macaroni - Veg", "classics", 169, macaroniImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("macaroni-nonveg", "Macaroni - Non-Veg", "classics", 189, macaroniImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("cottage-alfredo-veg", "Cottage Cheese Alfredo - Veg", "goodies", 189, cottageAlfredoImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("cottage-alfredo-nonveg", "Cottage Cheese Alfredo - Non-Veg", "goodies", 219, cottageAlfredoImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("high-fibre-veg", "High-Fibre Macaroni - Veg", "goodies", 169, highFibreMacaroniImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("high-fibre-nonveg", "High-Fibre Macaroni - Non-Veg", "goodies", 199, highFibreMacaroniImage, [{ label: "Sauce", choices: sauceOptions }]),
  menuProduct("tiramisu", "Tiramisu", "sugar", 160, tiramisuImage),
  menuProduct("tres-leches", "Tres Leches", "sugar", 140, tresLechesImage),
  menuProduct("brownie", "Brownie", "sugar", 110, brownieImage),
  menuProduct("five-layer-dream-tub", "Five Layer Dream Tub", "sugar", 230, fiveLayerDreamTubImage),
  menuProduct("korean-bun", "Korean Bun", "sugar", 120, dessertImage),
];

export const HERO_IMG =
  "https://images.pexels.com/photos/11220208/pexels-photo-11220208.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
export const BRAND_LOGO = "/images/logo.png";
export const MENU_IMAGE = "/menu.png";
export const HERO_DESSERT =
  "https://images.pexels.com/photos/33419744/pexels-photo-33419744.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
export const STORY_IMG =
  "https://images.pexels.com/photos/30630904/pexels-photo-30630904.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
export const KNEAD_IMG =
  "https://images.pexels.com/photos/10791772/pexels-photo-10791772.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

export const INSTA_POSTS = [
  {
    img: "https://images.pexels.com/photos/14930717/pexels-photo-14930717.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    likes: "1,240",
  },
  {
    img: "https://images.pexels.com/photos/26838690/pexels-photo-26838690.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    likes: "980",
  },
  {
    img: "https://images.pexels.com/photos/30910495/pexels-photo-30910495.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    likes: "1,530",
  },
  {
    img: "https://images.pexels.com/photos/15911843/pexels-photo-15911843.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    likes: "2,104",
  },
  {
    img: "https://images.pexels.com/photos/11220209/pexels-photo-11220209.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    likes: "1,870",
  },
  {
    img: "https://images.pexels.com/photos/35622247/pexels-photo-35622247.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    likes: "760",
  },
];

export function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}
