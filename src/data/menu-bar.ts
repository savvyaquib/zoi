import type { Menu } from "./menu-types";

/**
 * The bar menu, transcribed from "PRICE CHECK_BAR NEW MENU.pdf" in print order.
 *
 * Same rules as the food file: the client's words, prices and order; only
 * unambiguous spelling corrected. Two descriptions are pasted from a different
 * drink in the PDF and are LEFT OUT rather than published wrong — marked
 * `// TODO client:` below. Electric Shock has no ingredient list in the PDF
 * and is printed with its tagline only, exactly as designed.
 *
 * Spirits, wines and beers are price-only lists, as printed.
 */
export const BAR_MENU: Menu = {
  id: "bar",
  title: "Bar",
  disclaimer:
    "All prices are in Indian rupees and subject to additional government taxes. Please do let your server know should you be allergic to any kind of food. We levy 5% service charge. Service charge is voluntary, please let us know if it should be removed. Enjoy responsibly. We do not serve alcoholic beverages to guests below 21 years of age.",
  sections: [
    {
      id: "signature-cocktails",
      title: "Zoi Signature & Crafted Cocktails",
      art: { src: "/assets/menu/bar-signature.jpg", width: 360, height: 516, alt: "" },
      groups: [
        {
          label: "Signature Collection",
          items: [
            { name: "Pearl Blossom", price: 675, description: "Vodka, lychee & a hint of rose water — fragrant, smooth & utterly elegant." },
            { name: "Botanic Breeze", price: 675, description: "Gin, cool cucumber, zesty lime & tonic water — crisp, refreshing & refined." },
            // TODO client: the PDF prints a paneer tikka description under this cocktail.
            { name: "Velvet Praline", price: 675 },
            { name: "The Jasmine Pearl", price: 675, description: "Jasmine, lychee & gin, finished with saline clarity — delicate & refined." },
            { name: "Drift & Smoke", price: 675, description: "Gin shaken with grapefruit & thyme, finished with a soft hint of smoke — bitter-citrus upfront, dry aromatic finish." },
            { name: "Black Velvet Brew", price: 675, description: "Vodka & cold brew coffee with roasted cocoa nibs, hazelnut & activated charcoal — bittersweet & bold." },
            { name: "House of Orange Elixir", price: 675, description: "Rose & star anise infused tequila layered with orange juice, citrus & a sparkling finish." },
            { name: "Green Ember Picante", price: 675, description: "Tequila, fresh cucumber, jalapeño, coriander, lime and agave, finished with a smoked jalapeño kick." },
            { name: "Green Alchemy", price: 675, description: "Vodka shaken with green apple juice, celery, basil, lime and green pepper tincture — crisp herbal sour." },
            { name: "Yuzu Drift Cloud", price: 675, description: "White rum and coconut water with yuzu citrus and lime, topped with light matcha foam — crisp and modern." },
          ],
        },
        {
          label: "Signature Rum",
          items: [
            { name: "Zoi Tiki", price: 549, description: "Dark and light rum, orange juice, pineapple and grenadine — vibrant, exotic and festive." },
            // TODO client: the PDF repeats Botanic Breeze's gin description under this mojito.
            { name: "Passion Fruit Kaffir Lime Mojito", price: 549 },
            { name: "Tropical Daiquiri", price: 549, description: "White rum and sugar balanced with fresh lime — smooth, sophisticated and aromatic." },
          ],
        },
        {
          label: "Signature Gin",
          items: [
            { name: "Glimmering Mandar", price: 549, description: "Gin, lavender, blue pea tea, lime and tonic water — a stunning colour-changing experience." },
            { name: "Refined Ranchi", price: 549, description: "Gin, saffron, mango ginger, lime and egg white — smooth, elegant and exotic." },
            { name: "Elder Flower Oasis", price: 549, description: "Gin, elderflower syrup, ginger, coconut, lime and tonic — light, floral and refreshing." },
            { name: "Honey & Basil Gimlet", price: 549, description: "Gin, honey syrup, fresh basil and lime — balanced sweetness and herbal freshness." },
            { name: "Charcoal Collins", price: 549, description: "Gin, blackberry purée, activated charcoal syrup and lime — visually captivating and refreshing." },
          ],
        },
        {
          label: "Signature Tequila",
          items: [
            { name: "Tamarind & Chilli Margarita", price: 549, description: "Tequila, tamarind syrup, lime, chilli and peri peri — bold, spicy and exciting." },
            { name: "Bubble Ranchi", price: 549, description: "Tequila, bubble gum, guava, lime and sugar — playful, sweet and nostalgic." },
            { name: "Kokum Elixir", price: 549, description: "Tequila, kokum, curry leaves, ginger syrup, lime and salt — refreshing and uniquely aromatic." },
            { name: "Tequila Grape Vine", price: 549, description: "Tequila, grapefruit, black grapes, lime and sugar — vibrant, tangy and refreshing." },
            { name: "Ranchi Green Glow", price: 549, description: "Tequila, green apple, lime, almond syrup and star anise — fresh and aromatic." },
          ],
        },
      ],
    },
    {
      id: "mixologist",
      title: "Mixologist's Recommendations",
      art: { src: "/assets/menu/bar-mixologist.jpg", width: 576, height: 900, alt: "" },
      groups: [
        {
          label: "Whiskey Based",
          items: [
            { name: "Golden Zenith", price: 549, description: "Bourbon whiskey with exotic saffron, pineapple and kaffir lime leaves — bold, luxurious and refined." },
            { name: "Citrus Gold", price: 549, description: "Whiskey with orange marmalade, fresh orange juice, lime and sugar — sweet, tangy and vibrant." },
          ],
        },
        {
          label: "Vodka Based",
          items: [
            { name: "Jewel of Jharkhand", price: 549, description: "Vodka, fresh lime, cucumber, mint and soda — crisp, invigorating and locally inspired." },
            { name: "Blue Serenity", price: 549, description: "Vodka, lavender syrup, lime and ginger ale — aromatic, effervescent and delicate." },
            { name: "Bull Blast", price: 549, description: "Vodka, mango ginger, lime, blood orange and Red Bull — vibrant, energising and dynamic." },
          ],
        },
      ],
    },
    {
      id: "classic-cocktails",
      title: "Zoi Classic Cocktails",
      art: { src: "/assets/menu/bar-classic.jpg", width: 456, height: 708, alt: "" },
      groups: [
        {
          label: "Whiskey Based",
          items: [
            { name: "Classic Old Fashioned", price: 549, description: "Bourbon or rye, muddled sugar and Angostura bitters, garnished with an orange twist — smooth and timeless." },
            { name: "Whiskey Sour", price: 549, description: "Bourbon, lime, sugar and silky egg white — smooth, tangy and balanced." },
          ],
        },
        {
          label: "Vodka Based",
          items: [
            { name: "Cosmopolitan", price: 649, description: "Vodka, cranberry juice, lime and a touch of sugar with a hint of orange — crisp and elegant." },
            { name: "Bloody Mary", price: 649, description: "Vodka, tomato juice, lime, hot sauce, Worcestershire sauce and seasonings — bold and savory." },
            { name: "Moscow Mule", price: 649, description: "Vodka, fresh lime and ginger beer — zesty, bold and ice-cold." },
          ],
        },
        {
          label: "Rum Based",
          items: [
            { name: "Classic Mojito", price: 649, description: "White rum, mint, simple syrup and club soda — crisp, invigorating and beloved." },
            { name: "Piña Colada", price: 649, description: "Rum, coconut cream and pineapple juice — smooth, tropical and refreshing." },
          ],
        },
        {
          label: "Gin Based",
          items: [
            { name: "Tom Collins", price: 649, description: "Gin, lime, sugar and soda, garnished with a lemon slice — classic, crisp and refreshing." },
            { name: "Gin & Tonic", price: 649, description: "Gin and tonic water with a lime wedge — timeless, invigorating and clean." },
          ],
        },
        {
          label: "Tequila Based",
          items: [
            { name: "Classic Margarita", price: 549, description: "Tequila, lime and triple sec, served with a salted rim — refreshing, tangy and iconic." },
            { name: "Tequila Sunrise", price: 549, description: "Tequila, orange juice and grenadine — a stunning sunrise effect with sweet, citrusy flavor." },
            { name: "Paloma", price: 549, description: "Tequila, grapefruit juice, soda and lime with a salted rim — crisp and citrusy." },
          ],
        },
      ],
    },
    {
      id: "shot-room",
      title: "The Shot Room",
      art: { src: "/assets/menu/bar-shots.jpg", width: 456, height: 624, alt: "" },
      groups: [
        {
          items: [
            { name: "Kamikaze", price: 349, description: "Vodka, lime and triple sec — zesty, bold and refreshing." },
            { name: "Lychee Pop", price: 349, description: "Vodka, lychee, kaffir lime and lime — sweet, fruity and punchy." },
            { name: "Sunrise Shooter", price: 349, description: "Orange juice, grenadine and vodka layered for a sunrise-inspired burst of flavour." },
            { name: "Yuzu Rush", price: 349, description: "Gin, yuzu, ginger, lemongrass and lime — aromatic, zesty and electrifying." },
            { name: "Cold Flame", price: 349, description: "Tequila, cucumber, mint and jalapeño — cool entry, fiery finish." },
            { name: "Electric Shock", price: 349, description: "A sip and you're fully charged — intense, electric and unforgettable." },
            { name: "Sunset Ammo", price: 349, description: "Rum, passion fruit and bold orange — tropical, vibrant and unapologetic." },
          ],
        },
      ],
    },
    {
      id: "long-drinks",
      title: "Zoi Long Drinks",
      groups: [
        {
          items: [
            { name: "Long Island Red Twist", price: 649, description: "Classic LIIT topped with a splash of red wine for a fruity and elegant finish." },
            { name: "Classic LIIT", price: 649, description: "Vodka, rum, gin, tequila and triple sec with sour mix and cola — powerful and robust." },
            { name: "Golden Saffron Long Island", price: 649, description: "Classic LIIT enriched with saffron for a luxurious, aromatic touch." },
            { name: "Berry Long Island", price: 649, description: "Classic LIIT with cranberry and strawberry — refreshing, fruity and colourful." },
            { name: "Lime Leaf Elixir", price: 649, description: "Classic LIIT with kaffir lime leaves — aromatic and refreshingly unique." },
            { name: "Electric Frog", price: 649, description: "Vodka, rum, gin, tequila, blue curaçao and Red Bull — vibrant and electrifying." },
          ],
        },
      ],
    },
    {
      id: "spirits",
      title: "Spirits",
      art: { src: "/assets/menu/bar-whiskey-bottle.jpg", width: 204, height: 462, alt: "" },
      groups: [
        {
          label: "Single Malt Scotch Whiskey",
          items: [
            { name: "Glenfiddich 12 Years", price: 625 },
            { name: "Glenlivet 15 Years", price: 675 },
            { name: "Talisker 10", price: 599 },
            { name: "Glenlivet 12 Years", price: 575 },
          ],
        },
        {
          label: "Blended Scotch Whiskey",
          items: [
            { name: "Chivas 18 Years", price: 919 },
            { name: "JW Double Black", price: 575 },
            { name: "Dewar's 15", price: 575 },
            { name: "Chivas Regal 12", price: 499 },
            { name: "JW Black Label", price: 499 },
            { name: "JW Blonde", price: 499 },
            { name: "Dewar's 12", price: 419 },
            { name: "Ballantine's 12", price: 419 },
            { name: "JW Red Label", price: 325 },
            { name: "Black Dog Triple Gold", price: 319 },
            { name: "100 Pipers 12", price: 319 },
            { name: "Ballantine's Finest", price: 319 },
            { name: "Teacher's 50", price: 319 },
            { name: "Black Dog Black Reserve", price: 279 },
            { name: "100 Pipers Deluxe", price: 279 },
            { name: "Teacher's Highland Cream", price: 279 },
            { name: "Dewar's White Label", price: 279 },
            { name: "Royal Ranthambore", price: 279 },
            { name: "Black & White", price: 279 },
            { name: "VAT 69", price: 279 },
            { name: "Black Dog", price: 259 },
          ],
        },
        {
          label: "Irish & Bourbon",
          items: [
            { name: "Bushmills", price: 419 },
            { name: "Jameson Irish", price: 349 },
            { name: "Jim Beam White", price: 349 },
            { name: "Dewar's Japanese Smooth", price: 349 },
          ],
        },
        {
          label: "Vodka",
          items: [
            { name: "Grey Goose", price: 569 },
            { name: "Absolut", price: 329 },
            { name: "Absolut Citron", price: 329 },
            { name: "Smirnoff", price: 195 },
          ],
        },
        {
          label: "Rum",
          items: [
            { name: "Bacardi Ocho", price: 329 },
            { name: "Bacardi Superior", price: 219 },
            { name: "Bacardi Lemon", price: 219 },
            { name: "Bacardi Mango Chili", price: 219 },
            { name: "Bacardi Black", price: 219 },
            { name: "Old Monk XXX", price: 119 },
          ],
        },
        {
          label: "Tequila",
          items: [
            { name: "Patrón Reposado", price: 699 },
            { name: "Patrón Silver", price: 629 },
            { name: "Jose Cuervo Gold", price: 439 },
            { name: "Jose Cuervo Silver", price: 409 },
            { name: "Camino Gold", price: 399 },
            { name: "Camino Silver", price: 329 },
          ],
        },
        {
          label: "Gin",
          items: [
            { name: "Jaisalmer", price: 499 },
            { name: "Bombay Sapphire", price: 329 },
            { name: "Beefeater", price: 299 },
          ],
        },
      ],
    },
    {
      id: "wines",
      title: "Wines",
      art: { src: "/assets/menu/bar-wine.jpg", width: 640, height: 1168, alt: "" },
      groups: [
        { label: "Sparkling Wine", items: [{ name: "Sula Brut", price: 3999 }] },
        {
          label: "Red Wine",
          items: [
            { name: "Jacob's Creek Shiraz", price: 679 },
            { name: "Outback Jack Cabernet Merlot", price: 679 },
            { name: "Sula Cabernet Shiraz", price: 479 },
          ],
        },
        {
          label: "White Wine",
          items: [
            { name: "Jacob's Creek Chardonnay", price: 679 },
            { name: "Outback Jack Chardonnay", price: 679 },
            { name: "Sula Chenin Blanc", price: 679 },
          ],
        },
      ],
    },
    {
      id: "beers",
      title: "Beers",
      art: { src: "/assets/menu/bar-beer.jpg", width: 600, height: 1296, alt: "" },
      groups: [
        {
          items: [
            { name: "Tuborg", price: 499 },
            { name: "Budweiser Magnum", price: 499 },
            { name: "Bad Monkey", price: 429 },
            { name: "Budweiser Premium", price: 429 },
            { name: "Simba", price: 399, variants: "Strong / Lager / Wheat Beer" },
            { name: "SAB Australian", price: 369 },
            { name: "Kingfisher Strong", price: 369 },
            { name: "Kingfisher Ultra Max", price: 339 },
            { name: "Carlsberg", price: 339 },
            { name: "Heineken", price: 339 },
            { name: "Kingfisher Ultra", price: 339 },
            { name: "Kingfisher Premium", price: 339 },
          ],
        },
      ],
    },
    {
      id: "alcopops",
      title: "Alcopops",
      groups: [
        {
          items: [
            { name: "Breezer Jamaican Passion", price: 299 },
            { name: "Breezer Orange", price: 299 },
            { name: "Breezer Cranberry", price: 299 },
          ],
        },
      ],
    },
    {
      id: "mocktails",
      title: "House of Mocktails",
      art: { src: "/assets/menu/bar-mocktail.jpg", width: 348, height: 942, alt: "" },
      groups: [
        {
          items: [
            { name: "Beyond Sky", price: 299, description: "A dreamy, sky-inspired blend — mysterious, refreshing and visually stunning." },
            { name: "Blue Serenity", price: 299, description: "Cool, calming and beautifully blue — a serene escape in every sip." },
            { name: "Rose & Lychee Sparkle", price: 299, description: "Rose and lychee in a sparkling embrace — fragrant, floral and elegant." },
            { name: "Guava Chili Blast", price: 299, description: "A fiery, tangy fusion of guava and chilli — bold and unexpected." },
            { name: "Sunlit Elder", price: 299, description: "Elderflower kissed by sunshine — light, aromatic and refreshingly delicate." },
            { name: "Pom Breeze", price: 299, description: "Pomegranate and breeze in a glass — vibrant, fruity and refreshing." },
            { name: "Pink Cream", price: 299, description: "Creamy, dreamy pink delight — smooth, sweet and indulgent." },
            { name: "Bubblegum Bliss", price: 299, description: "Playful bubblegum flavours in a fizzy, fun mocktail — nostalgic and delightful." },
            { name: "Lime Water Zest", price: 299, description: "Zesty, zingy and perfectly balanced — a refreshing classic with a twist." },
            { name: "Zoi Signature Fizz", price: 299, description: "Fresh orange, basil and ginger with sweet and sour balance, topped with ginger ale." },
            { name: "The Green Edit", price: 299, description: "Green apple, celery, basil and green pepper — clean, sharp and beautifully balanced." },
            { name: "Silk Bloom", price: 299, description: "Jasmine, lychee and kaffir lime layered with cranberry and crisp citrus finish." },
            { name: "Tropical Silk", price: 299, description: "Coconut, lemongrass, kaffir lime and Thai ginger with sweet and sour, topped with lemonade." },
            { name: "Thetcha Twist", price: 299, description: "Green apple, coriander leaves, jalapeño with chaat masala — spicy and refreshing." },
          ],
        },
      ],
    },
    {
      id: "signature-beverages",
      title: "Signature Beverages",
      art: { src: "/assets/menu/bar-shake.jpg", width: 510, height: 906, alt: "" },
      groups: [
        {
          items: [
            { name: "The Aam Pora'r Cold Brew", price: 275, description: "Smoked raw mango cold brew — a bold, desi flavour you won't find anywhere else." },
            { name: "Hot Chocolate", price: 275, description: "Rich, velvety and deeply comforting — the ultimate indulgence." },
            { name: "Chocolate Berry Smoothie", price: 275, description: "Chocolate and berry in a luscious smoothie — rich, fruity and satisfying." },
            { name: "Flavored Lassi", price: 275, variants: "Saffron Rose", description: "Creamy, chilled and flavoured to perfection — a beloved classic." },
            { name: "Tropical Mango Smoothie", price: 275, description: "Sun-ripened mango blended smooth — tropical, sweet and vibrant." },
            { name: "Flavored Iced Tea", price: 275, description: "A refreshing flavoured iced tea — light, chilled and perfect anytime." },
          ],
        },
      ],
    },
    {
      id: "milkshakes",
      title: "Milkshakes",
      groups: [
        {
          items: [
            { name: "Tiramisu Oreo Bliss", price: 349, description: "Tiramisu flavours meet Oreo in a thick, indulgent milkshake — dessert in a glass." },
            { name: "KitKat Choco Shake", price: 349, description: "KitKat chocolate richness blended into a luscious shake — irresistible." },
            { name: "Strawberry Coconut Shake", price: 349, description: "Fresh strawberry and coconut blended into a creamy, tropical milkshake." },
            { name: "Blueberry Shake", price: 349, description: "Luscious blueberries blended smooth — rich, fruity and deeply satisfying." },
          ],
        },
      ],
    },
    {
      id: "boba-tea",
      title: "Boba Tea Over Ice",
      art: { src: "/assets/menu/bar-iced-tea.jpg", width: 426, height: 912, alt: "" },
      groups: [
        {
          items: [
            { name: "Peach Basil Iced Tea", price: 249, description: "Peach with fresh basil, black tea and lime served over ice — fragrant and refreshing." },
            { name: "Jasmine Lychee Iced Tea", price: 249, description: "Jasmine tea with lychee and lime served over ice — floral, delicate and chilled." },
            { name: "Mango Ginger Iced Tea", price: 249, description: "Black tea with mango, fresh ginger and lime served over ice — tropical and invigorating." },
            { name: "Green Apple Mint Iced Tea", price: 249, description: "Green tea with green apple, mint, lime and a punch of sea salt served over ice." },
          ],
        },
      ],
    },
    {
      id: "cold-beverages",
      title: "Cold Beverages",
      art: { src: "/assets/menu/bar-cold-coffee.jpg", width: 426, height: 414, alt: "" },
      groups: [
        {
          items: [
            { name: "Cranberry Cold Brew", price: 255, description: "Bold cold brew infused with tangy cranberry — smooth, rich and refreshing." },
            { name: "Orange Cold Brew", price: 255, description: "Cold brew with a burst of orange — smooth, citrusy and invigorating." },
            { name: "Apple Honey Cold Brew", price: 255, description: "Cold brew sweetened with apple and honey — smooth, mellow and comforting." },
            { name: "Classic Cold Coffee", price: 245, description: "A timeless chilled coffee — smooth, bold and satisfying." },
            { name: "Iced Mocha Latte", price: 225, description: "Rich espresso, chocolate and milk over ice — indulgent and bold." },
            { name: "Iced Cappuccino", price: 255, description: "Espresso and frothy milk served iced — balanced and refreshing." },
            { name: "Iced Latte", price: 195, description: "Smooth espresso over cold milk and ice — clean and refreshing." },
          ],
        },
      ],
    },
    {
      id: "coffee",
      title: "Coffee",
      art: { src: "/assets/menu/bar-coffee.jpg", width: 640, height: 482, alt: "" },
      groups: [
        {
          items: [
            { name: "Nameless", price: 225, description: "A mysterious, house-crafted coffee experience — ask your server for today's secret." },
            { name: "Flat White", price: 195, description: "Velvety microfoam espresso — rich, smooth and perfectly balanced." },
            { name: "Cappuccino", price: 195, description: "Classic espresso with steamed milk foam — comforting and timeless." },
            { name: "Latte", price: 195, description: "Espresso with creamy steamed milk — smooth, mellow and easy-drinking." },
            { name: "Americano", price: 175, description: "Espresso diluted with hot water — bold, clean and classic." },
            { name: "Espresso", price: 175, description: "Pure, concentrated espresso — intense and unapologetic." },
          ],
        },
      ],
    },
    {
      id: "tea",
      title: "Tea",
      groups: [
        {
          items: [
            { name: "Blue Tea", price: 249, description: "Butterfly pea flower tea — visually stunning, floral and calming." },
            { name: "Jasmine Green", price: 249, description: "Delicate jasmine blossoms with green tea — fragrant, light and soothing." },
            { name: "Green Tea", price: 225, description: "A vibrant, fresh green tea blend — clean, healthful and revitalising." },
            { name: "Masala Tea", price: 225, description: "A spiced Indian classic — bold, warming and deeply satisfying." },
            { name: "Purple Tea", price: 199, description: "Rare purple tea — antioxidant-rich and beautifully unique." },
            { name: "Earl Grey Black", price: 199, description: "Classic bergamot-infused black tea — aromatic and refined." },
            { name: "Lemon Tea", price: 199, description: "Bright, zesty and refreshing — a timeless favourite." },
            { name: "Chamomile Tea", price: 199, description: "Gentle chamomile — calming, soothing and perfect for winding down." },
            { name: "Rose Tea", price: 199, description: "Delicate rose petals brewed to fragrant perfection." },
          ],
        },
      ],
    },
    {
      id: "juices",
      title: "Fresh Cold Pressed Juices",
      art: { src: "/assets/menu/bar-juice.jpg", width: 420, height: 972, alt: "" },
      groups: [
        {
          items: [
            { name: "Watermelon Juice", price: 299, description: "Pure, cold-pressed watermelon — hydrating, sweet and deeply refreshing." },
            { name: "Pineapple Juice", price: 299, description: "Cold-pressed pineapple — tropical, tangy and vibrant." },
            { name: "Orange Juice", price: 299, description: "Freshly pressed orange juice — bright, natural and energising." },
          ],
        },
      ],
    },
    {
      id: "matcha",
      title: "Matcha",
      art: { src: "/assets/menu/bar-matcha.jpg", width: 474, height: 720, alt: "" },
      groups: [
        {
          items: [
            { name: "Iced Strawberry Matcha", price: 249, description: "Vibrant strawberry meets earthy matcha over ice — beautiful and energising." },
            { name: "Blueberry Matcha", price: 249, description: "Blueberry and matcha in a stunning iced blend — antioxidant-rich and delicious." },
            { name: "Mango Matcha", price: 249, description: "Tropical mango meets Japanese matcha — exotic, vibrant and refreshing." },
            { name: "Coco Matcha", price: 249, description: "Coconut and matcha in perfect harmony — creamy, tropical and smooth." },
            { name: "Mint & Honey Matcha", price: 249, description: "Fresh mint, honey and matcha — cooling, sweet and perfectly balanced." },
            { name: "Cold Matcha", price: 199, description: "Pure matcha served cold — clean, focused and grounding." },
          ],
        },
      ],
    },
    {
      id: "refreshers",
      title: "Refreshers",
      groups: [
        {
          items: [
            { name: "Red Bull", price: 245, description: "The iconic energy drink — for when you need that extra lift." },
            { name: "Ginger Ale", price: 195, description: "Crisp, spiced ginger ale — a perfect mixer or standalone refresher." },
            { name: "Tonic Water", price: 195, description: "Premium tonic water — clean, slightly bitter and versatile." },
            { name: "Diet Coke", price: 145, description: "The classic diet cola — light and refreshing." },
            { name: "Coke Can", price: 145, description: "Ice-cold Coca-Cola — the timeless classic." },
            { name: "Sprite Can", price: 145, description: "Lemon-lime sparkle — crisp, clean and refreshing." },
            { name: "Packaged Drinking Water", price: 100, description: "Still water — pure and essential." },
          ],
        },
      ],
    },
  ],
};
