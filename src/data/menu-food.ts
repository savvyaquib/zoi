import type { Menu } from "./menu-types";

/**
 * The food menu, transcribed from "MENU JUNE 26.pdf" in the order it prints.
 *
 * ── What was and was not changed ────────────────────────────────────────────
 *
 * Names, prices and descriptions are the client's own. Only unambiguous
 * spelling slips are corrected (traditiobnal → traditional, FLLAVOURED →
 * FLAVOURED, bheki → bhetki, clay over → clay oven, tradistional →
 * traditional, delicated → delicate, triyaki → teriyaki, Hunah → Hunan,
 * frangrance → fragrance, flavoful → flavourful, CRIPSPY → CRISPY, KASMIRI →
 * KASHMIRI, sause → sauce, FOCASSIA → FOCACCIA, BONAZA → BONANZA).
 *
 * Four descriptions in the PDF are pasted from a different dish and are LEFT
 * OUT rather than published wrong — each is marked `// TODO client:` below.
 * The item and price stay; only the description is blank until the client
 * supplies the right one. One duplicated item (Chilli Basil Prawns, printed
 * twice on the same page) appears once.
 */
export const FOOD_MENU: Menu = {
  id: "food",
  title: "Food",
  disclaimer:
    "All prices are in INR & subject to applicable government taxes. Please do let the server know should you be allergic to any kind of food. We levy 5% of Service Charge. Service charge is voluntary, please let us know if it should be removed.",
  sections: [
    {
      id: "soups",
      title: "Soups",
      photo: {
        src: "/assets/menu/photo-shared-table.jpg",
        width: 830,
        height: 1173,
        alt: "Plates being shared across the table at Zoi — hands reaching for tikka, fries and dips",
      },
      art: { src: "/assets/menu/art-soups.png", width: 564, height: 786, alt: "" },
      groups: [
        {
          items: [
            { name: "Tom Kha", price: 245, description: "Thick soup with silken coconut extract infused with Thai herbs." },
            { name: "Hot & Sour", price: 245, description: "A traditional broth made with fresh greens, silken tofu, shiitake mushroom." },
            { name: "Manchow", price: 245, description: "A spicy concoction offering great flavours and texture." },
            { name: "Creamy Wild Forest Fungi Cappuccino", price: 245, description: "Wholesome and creamy mushroom soup served as cappuccino." },
            { name: "Lemon & Coriander", price: 245, description: "Delicious preparation of fresh lemon, coriander and exotic organic vegetables." },
          ],
        },
      ],
    },
    {
      id: "salads",
      title: "Salads",
      groups: [
        {
          items: [
            // TODO client: the PDF repeats Tom Kha's description here.
            { name: "Caesar's", price: 345 },
            { name: "Goat Cheese & Roasted Pear", price: 395, description: "Cinnamon honey roasted pears served with pistachio crusted goat cheese & wine soaked grapes." },
            { name: "Grilled Green & Quinoa with Feta", price: 395, description: "Grilled fresh vegetables, quinoa, feta and a generous sprinkle of sunflower seeds." },
          ],
        },
      ],
    },
    {
      id: "small-plates",
      title: "Small Plates",
      art: { src: "/assets/menu/art-small-plates.png", width: 618, height: 798, alt: "" },
      groups: [
        {
          label: "Veg",
          diet: "veg",
          items: [
            { name: "Freshly Harvested Veggies Bruschetta", price: 395, description: "Herb rubbed grilled bread with flavourful toppings & mixed greens." },
            { name: "Truffle Flavoured Mushroom with Warm Olive & Greens", price: 395, description: "Truly delicious truffle flavoured sautéed mixed mushroom with warm olives & assorted olive tapenade in a bed of young greens." },
            { name: "Zoi Paneer Tikka", price: 395, description: "Classic paneer tikka with a twist of Rajasthani chilli mixed cream served with mint dip." },
            { name: "Tofu Fusion Bites", price: 395, description: "Crispy fried tofu tossed in chilli garlic sauce." },
            { name: "Cantonese Cottage Cheese", price: 395, description: "Batter coated fried cubes of cottage cheese tossed in spicy chilli sauce garnished with spring onions." },
            { name: "Wok Tossed Wild Mushrooms with Sichuan Pepper", price: 395, description: "Assorted wild mushrooms tossed with Szechuan peppercorns." },
            { name: "Harissa Paneer Tikka", price: 395, description: "Delicately flavoured with harissa, these soft cottage cheese tikkas are a treat to eat." },
            { name: "Not Just Kulcha", price: 395, description: "Mini kulchas stuffed with spicy cheese, drizzled with truffle oil, served with cocktail yoghurt dip." },
            { name: "Creamy Mushroom & Asparagus in Puff Pastry", price: 395, description: "Buttery puff pastry filled with mushroom & asparagus." },
            { name: "Harissa Char Grilled Broccoli", price: 345, description: "Hung curd marinated garden fresh broccoli delicately flavoured & spiced with harissa in a clay oven." },
            { name: "Imperial Kebab", price: 345, description: "Fresh spinach, green peas & potato tikkis flavoured with handpicked Indian spices, finished in a thick bottomed metal pan." },
            { name: "Tandoori Broccoli with Malai Twist", price: 345, description: "Yoghurt & cardamom spiced broccoli with truffle oil served with spicy tomato dip." },
            { name: "Zoi Lotus Stem Sizzle", price: 345, description: "Crisp fried lotus stem tossed with honey & chillies." },
            { name: "Crispy Little Ear Baby Corn", price: 345, description: "Crispy fried baby corn tossed with salt, pepper and subtle spices." },
            { name: "Crispy Corn Salt & Pepper", price: 345, description: "Crunchy corn bites finished with classic salt and pepper seasoning." },
            { name: "Dahi Ke Kabab", price: 325, description: "Deep fried yoghurt patty mixed with flavourful Indian spices." },
            { name: "Spiced Mushroom 65", price: 325, description: "Deep fried mushroom tossed in chef's special spices & tempered with garlic & curry leaves." },
            { name: "Crispy Spaghetti & Vegetable Croquettes", price: 325, description: "Crispy croquette combined with spaghetti & vegetables served with fries." },
            { name: "Soya Malai Chaap", price: 325, description: "Soft soya chaap cooked in creamy malai with delicate spices." },
            { name: "Loaded Nachos", price: 295, description: "Tortilla chips layered with cheese & flavourful toppings." },
            { name: "Barbequed Potato Wedges", price: 255, description: "Flour dusted deep fried potato with BBQ sauce." },
            { name: "Parmesan Fries", price: 255, description: "Fries served with mayo." },
            { name: "Cheese Garlic Bread", price: 255, description: "French bread topped with garlic herb, butter & cheese." },
          ],
        },
        {
          label: "Non-Veg",
          diet: "non-veg",
          items: [
            { name: "Kerala Style Lamb Pepper Treat", price: 525, description: "Boneless lamb tempered with garlic, onions, tomatoes & curry leaves." },
            { name: "Lemongrass Bhetki", price: 525, description: "Lemongrass flavoured Kolkata bhetki cooked grilled in the clay oven & served with mint sauce." },
            { name: "Dawat-e-Galouti", price: 525, description: "Kebabs made of tender mutton mince, shallow fried in desi ghee & served on a flaky paratha." },
            { name: "Ajwaini Fish Tikka", price: 525, description: "Tandoori fish tikka flavoured with aromatic ajwain & spices." },
            // TODO client: the PDF repeats Bhatti da Murgh's chicken description here.
            { name: "Char Grilled Prawns with Harissa & Fresh Salad", price: 495 },
            { name: "Pumpkin Prawns", price: 495, description: "Deep fried prawns served with pumpkin sauce." },
            { name: "Chilli Basil Prawns", price: 495, description: "Wok-tossed prawns with fresh basil and bold chilli flavours." },
            { name: "Garlic Butter Prawns with Mixed Greens", price: 495, description: "Prawns tossed with garlic, olive oil and pepperoncini, served with mixed greens." },
            { name: "Prawns Balchao", price: 495, description: "Goan-style prawns cooked in a spicy, tangy balchao masala." },
            { name: "Tandoori Prawns Skewers", price: 495, description: "Char-grilled prawns skewered & infused with traditional masala." },
            { name: "Tangri Kebab", price: 445, description: "Tandoori roasted chicken drumsticks marinated in traditional spices." },
            { name: "Bhatti da Murgh", price: 445, description: "Chicken marinated with chef's special ingredients & grilled in a traditional clay oven." },
            { name: "Hyderabadi Fiery Favourite", price: 415, description: "Hyderabadi style deep fried chicken." },
            { name: "Lasooni Murgh Tikka", price: 415, description: "Roasted garlic flavoured chicken tikka grilled in charcoal fire & served with mint & yogurt dip." },
            { name: "Sunheri Malai Murgh", price: 415, description: "Succulent chicken pieces marinated overnight in cream cheese flavoured with cardamom & cooked in open flame." },
            { name: "Murgh Tikka Pakhtooni", price: 415, description: "Old Delhi style classic chicken tikka served with a mint & yogurt dip." },
            { name: "Classic Fried Hong Kong Basil Chicken", price: 415, description: "Classic tossed with garlic & basil in oyster sauce." },
            { name: "Kung Pao Chicken", price: 415, description: "Succulent chicken pieces, sliced onions, capsicum & bird-eye chillies. Tossed with cashew nuts." },
            { name: "The Spicy Hook", price: 415, description: "Deep fried fish pieces tossed in spicy chilli basil." },
            { name: "Tempura Fried Fish", price: 415, description: "Basa fingers deep fried in beer batter & served with tartar sauce." },
            { name: "Fried Up Wings", price: 415, description: "Crispy baked chicken wings smothered in a sweet & tangy barbecue sauce." },
            { name: "Poultry Tidbits", price: 415, description: "Italian way of crunchy chicken nuggets served with onion rings, fries & garlic aioli." },
            { name: "Crispy Calamari Chaat", price: 395, description: "Golden fried calamari with tangy chaat spices." },
            { name: "Kerala-Style Egg Fry", price: 295, description: "Boiled eggs pan-fried with Kerala spices, curry leaves & onions." },
          ],
        },
      ],
    },
    {
      id: "dim-sum",
      title: "Dim Sum",
      photo: {
        src: "/assets/menu/photo-dim-sum.jpg",
        width: 1173,
        height: 830,
        alt: "Bao and dumplings in a bamboo steamer, topped with a chilli garnish",
      },
      groups: [
        {
          label: "Veg",
          diet: "veg",
          items: [
            { name: "Asparagus Cream Cheese Dumpling", price: 395, description: "Asparagus, water chestnut & cream cheese dumpling." },
            { name: "Wild Mushroom & Truffle Dumpling", price: 395, description: "Assortment of pan tossed mushroom flavoured with truffle oil." },
            { name: "Exotic Vegetable Dumpling", price: 395, description: "Assorted exotic vegetables wrapped in delicate dumpling." },
          ],
        },
        {
          label: "Non-Veg",
          diet: "non-veg",
          items: [
            { name: "Chicken & Coriander Dumpling", price: 415, description: "Minced chicken flavoured with fresh bird eye chilli & coriander leaves." },
            { name: "Chicken & Cream Cheese Dumpling", price: 415, description: "Soft dumplings filled with diced chicken & melted cheese." },
            { name: "Thai Basil Chicken Dumpling", price: 415, description: "Juicy chicken infused with fragrant Thai basil." },
          ],
        },
      ],
    },
    {
      id: "mantou-bao",
      title: "Mantou Bao",
      groups: [
        {
          items: [
            { name: "Cheesy Bonanza Cloud Bao", price: 315, diet: "veg", description: "Indian cheese tossed with chilli sauce, served in mantou bread." },
            { name: "K. Town Chicken Seoul Bao", price: 395, diet: "non-veg", description: "Traditional chicken bites flavoured with teriyaki & Hoisin sauce served miko." },
          ],
        },
      ],
    },
    {
      id: "wok-sushi",
      title: "Wok & Sushi Roll",
      groups: [
        {
          label: "Veg",
          diet: "veg",
          items: [
            { name: "Aspara Tempura Bliss", prices: [455, 725] },
            { name: "Yasai Tempura Garden", prices: [425, 675] },
            { name: "Kimbab Avocado Sushi Roll", prices: [425, 675] },
            { name: "Crunchy Uramaki Tofu Roll", prices: [425, 675] },
          ],
        },
        {
          label: "Non-Veg",
          diet: "non-veg",
          items: [
            { name: "Ebi No Tempura Roll", prices: [475, 825] },
            { name: "Salmon Hidden Treasure", prices: [475, 825] },
            { name: "Katsu Chicken Maki Roll", prices: [475, 825] },
          ],
        },
      ],
    },
    {
      id: "pizza",
      title: "Pizza",
      art: { src: "/assets/menu/art-pizza.png", width: 606, height: 306, alt: "" },
      groups: [
        {
          label: "Veg",
          diet: "veg",
          items: [
            { name: "Farmfresh", price: 475, description: "Classic pizza topped with bell pepper, onion, zucchini, jalapeños & olives." },
            { name: "Four Cheeze Pizza", price: 475, description: "Classic pizza topped with cheddar, mozzarella, scamorza & parmesan with white truffle oil." },
            { name: "Bufala", price: 475, description: "Classic pizza topped with sun dried tomatoes, olives & mozzarella." },
            { name: "Wild Mushroom & Truffle", price: 475, description: "Mixed fungi, white base, caramelized onion & truffle oil with rocket lettuce." },
            { name: "Paneer Makhani Pizza", price: 475, description: "Creamy tomato makhani base with paneer, onions & sweet corn." },
          ],
        },
        {
          label: "Non-Veg",
          diet: "non-veg",
          items: [
            { name: "Pepperoni", price: 495, description: "Classic pizza topped with mozzarella cheese & spicy chicken pepperoni." },
            { name: "Chicken Tikka", price: 495, description: "Classic pizza topped with chicken tikka, green chilli & red onion rings." },
            { name: "Smoked Chicken", price: 495, description: "Classic pizza topped with smoked chicken, rucola, feta & chilli." },
            { name: "Chicken Makhani Pizza", price: 495, description: "Smokey chicken tikka on creamy makhani sauce." },
          ],
        },
      ],
    },
    {
      id: "sourdough",
      title: "Oven Fresh Sour Dough Garlic Bread",
      groups: [
        {
          items: [
            { name: "Mixed Mushrooms & Olives", price: 325, diet: "veg", description: "Home made sour dough topped with olives, shiitake & button mushrooms." },
            { name: "Sourdough with Chilli, Garlic & Olive Oil", price: 325, diet: "veg", description: "Home made sour dough topped with chilli garlic & extra virgin olive oil." },
            { name: "Rosemary Focaccia", price: 325, diet: "veg", description: "Fresh oven baked, hand stretched focaccia, infused with fragrant rosemary and garlic." },
            { name: "Harissa Chicken & Bell Pepper", price: 375, diet: "non-veg", description: "Home made sour dough bread topped with harissa marinated chicken, roasted bell pepper & onion in chilli oil." },
          ],
        },
      ],
    },
    {
      id: "pasta",
      title: "Zoi Hand Made Pasta",
      art: { src: "/assets/menu/art-pasta.png", width: 546, height: 438, alt: "" },
      groups: [
        {
          items: [
            { name: "Fettuccine with Fungi", price: 515, diet: "veg", description: "Tossed with mushroom truffle butter." },
            { name: "Spinach & Ricotta Ravioli", price: 515, diet: "veg", description: "Pasta stuffed with spinach & ricotta, tossed with light pomodoro plum sauce." },
            { name: "Vegetable Lasagne", price: 475, diet: "veg", description: "Oven-baked layers of vegetables, pasta & creamy cheese." },
            { name: "Linguine with Prawn", price: 545, diet: "non-veg", description: "Tossed in rich creamy bisque." },
            { name: "Chicken Lasagne", price: 495, diet: "non-veg", description: "Tender chicken layered with rich sauces & melted cheese." },
            {
              name: "Penne or Spaghetti in a Sauce of Your Choice",
              price: 425,
              diet: "veg",
              description: "Served al dente, with a slice of garlic bread, chilli flakes and oregano.",
              note: "Add ons: Chicken & Prawns.",
            },
          ],
        },
      ],
    },
    {
      id: "burgers",
      title: "Burgers",
      groups: [
        {
          items: [
            { name: "Triple Temptation Cottage Cheese Burger", price: 415, diet: "veg", description: "Cottage cheese marinated with three spices, served with coleslaw, fries & house greens." },
            { name: "In-House Cajun Marinated Polo Tender Crispy Burger", price: 445, diet: "non-veg", description: "Cajun marinated polo, panko fried, served with coleslaw, fries & house greens." },
          ],
        },
      ],
    },
    {
      id: "oriental",
      title: "Oriental",
      art: { src: "/assets/menu/art-oriental.png", width: 456, height: 582, alt: "" },
      groups: [
        {
          label: "Veg",
          diet: "veg",
          items: [
            { name: "Wok Tossed Seasonal Vegetables", price: 315, description: "Mixed vegetable tossed with garlic & soya sauce." },
            { name: "Stir Fried Vegetables", price: 315, description: "An assortment of vegetables, cooked in Chinese wine flavoured chef's special sauce." },
            { name: "Crispy Vegetable in Chilli Garlic Sauce", price: 315, description: "Crunchy vegetables tossed in fiery chilli garlic sauce." },
            { name: "Asian-Style Glazed Vegetables", price: 315, description: "Sweet & tangy glazed garden vegetables with aromatic spices." },
          ],
        },
        {
          label: "Non-Veg",
          diet: "non-veg",
          items: [
            { name: "Chicken Butter Garlic", price: 425, description: "Tender fried chicken tossed in rich butter garlic sauce." },
            { name: "Stir Fried Chicken", price: 425, description: "With mushroom & bamboo shoots." },
            { name: "Hunan Chicken", price: 425, description: "Sliced chicken cooked with Chinese wine flavoured Hunan sauce." },
            { name: "Schezwan Fish", price: 445, description: "Fish cooked in flavourful sauce comprising of Schezwan, peppercorn, soy & exotic spices." },
          ],
        },
      ],
    },
    {
      id: "rice-noodles",
      title: "Rice & Noodles",
      groups: [
        {
          priceLabels: ["Veg", "Egg", "Chicken"],
          items: [
            { name: "Singapore Noodles", prices: [325, 375, 395] },
            { name: "Singapore Fried Rice", prices: [325, 375, 395] },
            { name: "Burnt Garlic Sticky Rice", prices: [300, 325, 375] },
            { name: "Thai Basil Fried Rice", prices: [300, 325, 375] },
            { name: "Chilli Garlic Noodles", prices: [300, 325, 375] },
            { name: "Hakka Noodles", prices: [300, 325, 375] },
            { name: "Fried Rice", prices: [300, 325, 375] },
          ],
        },
      ],
    },
    {
      id: "thai-curry",
      title: "Thai Curry",
      art: { src: "/assets/menu/art-thai.png", width: 342, height: 522, alt: "" },
      groups: [
        {
          priceLabels: ["Veg", "Chicken", "Seafood"],
          items: [
            { name: "Thai Green Curry", prices: [545, 595, 645] },
            { name: "Thai Red Curry", prices: [545, 595, 645] },
          ],
        },
      ],
    },
    {
      id: "risotto",
      title: "Risotto",
      groups: [
        {
          items: [
            { name: "Wild Mushroom & Truffle", price: 515, diet: "veg", description: "Classic rich risotto cooked with wild mushrooms & truffle oil." },
            { name: "Creamy Tomato Risotto with Mascarpone", price: 515, diet: "veg", description: "Classic rich risotto cooked in a tomato base, finished with velvety mascarpone." },
            { name: "Saffron & Smoked Chicken Risotto", price: 595, diet: "non-veg", description: "Rice cooked with chicken and saffron in an abundance of butter and parmesan, finished with cream." },
          ],
        },
      ],
    },
    {
      id: "grills",
      title: "Grills",
      art: { src: "/assets/menu/art-grills.png", width: 216, height: 600, alt: "" },
      groups: [
        {
          label: "Veg",
          diet: "veg",
          items: [
            { name: "Pan Fried Cottage Cheese Steak with Mushroom Ragu", price: 495, description: "A thick-cut cottage cheese steak pan-seared to a golden crust, served over a rich, slow-cooked mushroom ragu." },
          ],
        },
        {
          label: "Non-Veg",
          diet: "non-veg",
          items: [
            { name: "Pan Seared Chicken in Wild Mushroom & White Wine", price: 495, description: "Pan fried tender thin slices of chicken gently cooked in mushroom sauce with a dash of aged white wine." },
            { name: "Grilled Chicken with Fondant Potato & Greens", price: 475, description: "Roasted chicken served with three peppers sauce, fresh garden greens & potatoes." },
            { name: "Grilled Bhetki with Herb Marinade & Roasted Vegetables", price: 545, description: "Pan-seared bhetki fillet, marinated in chermoula, served with herbed couscous, vegetables, crushed potatoes & caper butter sauce." },
          ],
        },
      ],
    },
    {
      id: "indian-mains",
      title: "Indian Mains",
      art: { src: "/assets/menu/art-indian-veg.png", width: 540, height: 756, alt: "" },
      groups: [
        {
          label: "Veg",
          diet: "veg",
          items: [
            { name: "Mushroom Matar Masala", price: 395, description: "Tender peas & mushrooms in rich spicy gravy." },
            { name: "Kadhai Paneer", price: 375, description: "Paneer tossed with bell pepper in a fragrant fresh ground spice powder." },
            { name: "Paneer Makhmali", price: 375, description: "Cottage cheese braised in rich makhani gravy." },
            { name: "Angara Paneer Masala", price: 375, description: "Grilled paneer tikka cooked in a rich onion & tomato based gravy." },
            { name: "Paneer Khurchan", price: 375, description: "Spiced cottage cheese sautéed with bell peppers." },
            { name: "Subz Lababdar", price: 375, description: "Mixed vegetables in a creamy tomato-based gravy." },
            { name: "Slow Cooked Dal Harman", price: 345, description: "With whole urad dal, rajma, butter & spices." },
            { name: "Sunheri Kofta Naramdil", price: 345, description: "Vegetable balls with a soft centre cooked in a rich & aromatic gravy." },
            { name: "Vegetable Diwani Handi", price: 325, description: "Mixed vegetables cooked in rich, aromatic gravy." },
            { name: "Maratha Kadhai Vegetable", price: 325, description: "Rustic vegetables cooked in fiery kadhai masala." },
            { name: "Subz Harvest Carnival", price: 315, description: "Mélange of seasonal vegetables." },
            { name: "Smokey Yellow Dal Bliss", price: 295, description: "Mixed dal tadka with smoked garlic, cumin & red chilli." },
          ],
        },
        {
          label: "Non-Veg",
          diet: "non-veg",
          items: [
            { name: "Mutton Dak Bunglow", price: 545, description: "A fragrant goat meat curry dating back to colonial times cooked with special spices and potatoes." },
            { name: "Rajasthani Laal Maas", price: 545, description: "Slow cooked mutton in fiery red chilli gravy." },
            { name: "Kashmiri Rogan Josh", price: 525, description: "Succulent mutton pieces slow cooked in a fragrant & thin curry & finished to perfection with secret Indian spices." },
            { name: "Tandoori Prawn Masala", price: 495, description: "Smokey prawns cooked in rich tandoori masala." },
            { name: "Smoked Tandoori Fish Curry", price: 475, description: "Tender fish with smokey tandoori aroma & spiced gravy." },
            { name: "Amritsari Fish Masala", price: 475, description: "Crispy spiced fish tossed in bold Amritsari flavours." },
            { name: "Murgh Tikka Masala", price: 445, description: "Select pieces of boneless chicken grilled in a clay oven & braised in a rich onion & tomato gravy." },
            { name: "Murgh Makhni", price: 445, description: "An all time favourite luxurious butter chicken." },
            { name: "Chicken Changezi", price: 445, description: "Tender chicken cooked in ghee & spices." },
            { name: "Tangri Chicken Masala", price: 445, description: "Chicken drumsticks cooked in rich spices." },
            { name: "Kadhai Murgh", price: 425, description: "A delightful chicken dish made with onions, tomatoes, garlic, ginger & fresh ground Indian spices." },
            { name: "Awadhi Murgh Korma", price: 425, description: "This classic chicken dish will take you on a tour of the royal kitchens of Awadh." },
            { name: "Zoi Special Chicken Curry", price: 425, description: "Signature curry with rich aromatic spices." },
          ],
        },
      ],
    },
    {
      id: "biryani",
      title: "Biryani & Rice",
      photo: {
        src: "/assets/menu/photo-biryani.jpg",
        width: 801,
        height: 1131,
        alt: "Dum biryani being served from a clay handi, saffron rice lifted on a spoon",
      },
      art: { src: "/assets/menu/art-biryani.png", width: 576, height: 822, alt: "" },
      groups: [
        {
          items: [
            { name: "Gosht Dum Biryani", price: 545, diet: "non-veg", description: "Tender goat meat pieces with fresh mint and brown onion, served with raita and salan." },
            { name: "Murgh Dum Biryani", price: 475, diet: "non-veg", description: "Succulent chicken pieces with mint and brown onion, served with raita and salan." },
            { name: "Subz Dum Biryani", price: 345, diet: "veg", description: "Mélange of vegetables & basmati rice infused with fragrance of cardamom & saffron, served with raita." },
            { name: "Jeera Matar Pulao", price: 225, diet: "veg", description: "Fragrant basmati rice cooked with cumin and fresh green peas, tempered with whole spices." },
            { name: "Steamed Rice", price: 175, diet: "veg" },
          ],
        },
      ],
    },
    {
      id: "breads",
      title: "Indian Breads",
      art: { src: "/assets/menu/art-breads.png", width: 402, height: 720, alt: "" },
      groups: [
        {
          items: [
            { name: "Kulcha", price: 105, variants: "Onion / Masala" },
            { name: "Tandoori Roti", price: 95, variants: "Plain / Butter / Crispy" },
            { name: "Lachedar Paratha", price: 95, variants: "Mirchi / Pudina" },
            { name: "Naan", price: 95 },
          ],
        },
      ],
    },
    {
      id: "desserts",
      title: "Desserts",
      art: { src: "/assets/menu/art-desserts.png", width: 414, height: 648, alt: "" },
      groups: [
        {
          items: [
            { name: "Fudgy Brownie with Ice Cream", price: 295, description: "Rich fudgy brownie served warm with vanilla ice cream. Ask for your choice — classic plated or sizzling style." },
            { name: "Classic Tiramisu Pull Me Up", price: 395, description: "Layers of coffee-soaked Savoiardi sponge, silky mascarpone cream, finished with rich flowing chocolate crémeux." },
            { name: "Crunchy Caramel Sponge with Toffee Sauce", price: 395, description: "Warm caramel sponge served with buttery toffee sauce, melting ice cream, and a crunchy nutty finish." },
            { name: "Matilda Pastry", price: 345, description: "Layers of moist cocoa sponge, chocolate crémeux, and glossy ganache." },
            { name: "Biscoff Cheesecake", price: 345, description: "Creamy cheesecake on a buttery biscuit base, finished with silky Biscoff caramel.", note: "Contains eggs" },
            { name: "Black Forest Pull Me Up", price: 415, description: "Layers of chocolate sponge, cherry compote, dark chocolate mousse, and vanilla Chantilly, finished with flowing chocolate sauce." },
            { name: "Deconstructed Banoffee Pie", price: 375, description: "A modern take on the classic — biscuit crumble, silky banana crémeux, coffee Chantilly, and brûléed banana." },
            { name: "Molten Chocolate Delight", price: 345, description: "Warm chocolate cake with a molten centre, served with vanilla ice cream." },
            { name: "Stroopwafels", price: 325, description: "Classic Dutch waffle cookies layered with Biscoff or Nutella." },
            { name: "Exotic Ice Creams", price: 195, description: "A selection of premium exotic ice creams." },
          ],
        },
      ],
    },
    {
      id: "healthy-plates",
      title: "Healthy Plates",
      art: { src: "/assets/menu/art-healthy.png", width: 396, height: 450, alt: "" },
      groups: [
        {
          items: [
            { name: "Pan Seared Salmon with Spinach & Orange Beurre Reduction", price: 895, diet: "non-veg", description: "Crispy pan seared over wilted spinach, finished with a silky orange beurre reduction." },
            { name: "Prawns Har Gow Dim Sum", price: 495, diet: "non-veg", description: "A traditional Cantonese preparation." },
            { name: "Grilled Chicken with Seasonal Vegetable & On Jus", price: 475, diet: "non-veg", description: "Tender herb grilled chicken served with fresh seasonal vegetables, finished with a rich pan jus." },
            { name: "Tofu Fusion Bites", price: 395, diet: "veg", description: "Crispy fried tofu tossed in chilli garlic sauce." },
            { name: "Funghi Saltati", price: 395, diet: "veg", description: "Truly delicious truffle flavoured sautéed mixed mushroom with warm olives & assorted olive tapenade in a bed of young greens." },
            { name: "Goat Cheese & Roasted Pear", price: 395, diet: "veg", description: "Cinnamon honey roasted pears served with pistachio crusted goat cheese & wine soaked grapes." },
            { name: "Grill Verdue & Quinoa with Feta", price: 395, diet: "veg", description: "Grilled fresh vegetable, quinoa, feta & a generous sprinkle of sunflower seeds." },
            { name: "Melone Burrata Italiano", price: 395, diet: "veg", description: "Pesto marinated melon, mixed greens & burrata cheese, drizzled with in-house dressing & balsamic reduction." },
            { name: "Peking Vegetable Dumpling", price: 395, diet: "veg", description: "Mushroom, bok choy, carrots & mock duck served with peking sauce." },
            { name: "Chukandri Flame Kissed Bites", price: 325, diet: "veg", description: "Sweet & tangy beetroot tikki shallow fried, topped with brown garlic & served with thousand island dip." },
          ],
        },
      ],
    },
  ],
};
