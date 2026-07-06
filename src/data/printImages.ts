// Kyte Baby Print Image Database
// Maps print names to their swatch image URLs from kytebaby.com print pages

export interface PrintInfo {
  name: string;
  imageUrl: string;
  year?: string;
}

// Comprehensive print database with swatch images from print pages
export const printDatabase: Record<string, string> = {
  // 2025 Hawaii Collection Solids
  "Poi": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-01-30_at_8.54.38_PM_600x600.png?v=1738292132",
  "Lilikoi": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-01-30_at_8.55.06_PM_600x600.png?v=1738292133",
  "Guava": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-01-30_at_8.54.56_PM_600x600.png?v=1738292133",
  "Makai": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-02-03_at_6.53.09_PM_600x600.png?v=1738630406",
  "Honu": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-01-30_at_8.54.25_PM_600x600.png?v=1738292133",
  "Canyon": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1_56bf9c05-889d-4a8c-a434-2f12e35ccf17.png?v=1747701715",
  "Mist": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-02-17_at_1.45.40_PM_600x600.png?v=1739821553",
  "Dew": "https://kytebaby.com/cdn/shop/files/1908DW-01.jpg",

  // 2025 Prints
  "Poi Rainbow": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-03-18_at_8.04.16_PM_600x600.png?v=1742346335",
  "Makai Rainbow": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-03-18_at_8.05.04_PM_600x600.png?v=1742346335",
  "Hibiscus": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-02-11_at_9.25.34_PM_600x600.png?v=1739332076",
  "Humpback": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-02-11_at_9.24.39_PM_600x600.png?v=1739332076",
  "Dolphin": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-02-11_at_9.25.18_PM_600x600.png?v=1739332076",
  "Blush Rabbit": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-02-19_at_3.34.38_PM_600x600.png?v=1740000903",
  "Ice Rabbit": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-02-19_at_3.34.19_PM_600x600.png?v=1740000903",
  "Aloe Chick": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-02-19_at_3.34.50_PM_600x600.png?v=1740000904",
  "Papaya": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-03-31_at_7.15.33_PM_600x600.png?v=1743466591",
  "Pineapple": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-03-31_at_7.14.09_PM_600x600.png?v=1743466623",
  "Dew Surf": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-04-30_at_3.13.53_PM.png?v=1746044087",
  "Yellowstone": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-05-27_at_8.50.31_PM.png?v=1748397150",
  "Yosemite": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-05-27_at_8.51.18_PM.png?v=1748397150",
  "Under the Stars": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-06-18_at_5.00.46_PM.png?v=1750301379",
  "Road Trip": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-06-18_at_5.00.57_PM.png?v=1750301379",
  "Harbor": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Harbor_96f26552-46ca-420d-be95-76ad096b2923.png?v=1753827137",
  "Blush Butterfly": "https://kytebaby.com/cdn/shop/files/kyte-baby-zippered-footies-zippered-footie-in-blush-butterfly-35281979080815.jpg",
  "Fishing": "https://kytebaby.com/cdn/shop/files/kyte-baby-zippered-footies-zippered-footie-in-fishing-35282042060911.jpg",
  "Love Bug": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-12-30_at_10.18.39_AM.png?v=1735575568",
  "Bee Mine": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-12-30_at_10.18.57_AM.png?v=1735575568",
  "Barbie Beach": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-03-02_at_9.06.26_PM_7e6bc0a5-dd90-4fbc-adcb-3bd0ca8bb73e_600x600.png?v=1740976423",
  "Barbie Astronaut": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-03-02_at_9.06.35_PM_5e5eeb6b-5779-40f6-a19f-5f41a25f169e_600x600.png?v=1740976423",
  "Golf": "https://kytebaby.com/cdn/shop/files/1911GOSG-01.jpg",
  "Vintage Truck": "https://kytebaby.com/cdn/shop/files/1911VT-01.jpg",
  "Liberty Rip Tide": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-04-23_at_11.44.46_AM.png?v=1745426950",
  "Celebration": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-04-23_at_11.44.33_AM.png?v=1745426950",
  "Wildflower": "https://kytebaby.com/cdn/shop/files/1911WFLR-01.jpg",
  "First Responder": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-12-17_at_2.02.22_PM.png?v=1734465752",
  "Vintage Baseball": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-04-16_at_4.41.49_PM_480x480.png?v=1713303749",

  // 2024 Solids
  "Wasabi": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-02-11_at_8.36.34_PM_600x600.png?v=1707705632",
  "Sakura": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-02-11_at_8.38.37_PM_600x600.png?v=1707705726",
  "Dusty Blue": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-02-11_at_8.39.37_PM_600x600.png?v=1707705819",
  "Ecru": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-02-11_at_8.37.56_PM_600x600.png?v=1707705674",
  "Wisteria": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-02-11_at_8.39.11_PM_600x600.png?v=1707705773",
  "Powder": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-05-22_at_5.54.15_PM.png?v=1716419792",
  "Mint": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-05-22_at_5.54.22_PM.png?v=1716419791",
  "Lilac": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-05-22_at_5.53.55_PM.png?v=1716419792",
  "Thyme": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Thyme_1bf338c7-9b90-4623-8705-fad1c0fc7e9f_480x480.png?v=1722915216",
  "Currant": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Currant_d7e97c35-a74c-447b-92e9-8fd2e1ecef3c_480x480.png?v=1722915216",
  "Loch": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Loch_d9804dda-66a7-4f3d-8c43-633b5069b668_480x480.png?v=1722915216",
  "Apricot": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Apricot_54d69d00-1db9-49c4-9edb-2e1fcdbe39f8_480x480.png?v=1722915216",
  "Evergreen": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-10-02_at_5.26.12_PM_480x480.png?v=1727907986",
  "Almond": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-10-11_at_6.18.56_PM_480x480.png?v=1728688756",

  // 2024 Prints
  "Construction": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1833CS-03_211bc4d4-364b-42bd-ac14-45d06a8d2c09_600x600.jpg?v=1709605300",
  "Cherry Blossom": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-03-12_at_3.41.19_PM_600x600.png?v=1710276135",
  "Midnight Rainbow Heart": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-01-02_at_8.17.40_PM_600x600.png?v=1704248440",
  "Cloud Rainbow Heart": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-01-02_at_8.17.08_PM_600x600.png?v=1704248391",
  "Daisy": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/2210MNDA_9bfab2e4-bcab-4fdd-80b9-c1cc5b9d2590_600x600.jpg?v=1698092819",
  "Hot Air Balloon": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/2210MNHA_e69d0d18-22ad-46d8-a8c2-aaa5e22438b7_600x600.jpg?v=1698092868",
  "Duck": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823DC-02_600x600.jpg?v=1708379351",
  "Goat": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823GO-02_600x600.jpg?v=1708379393",
  "Crocodile": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823CCWA-03_600x600.jpg?v=1709071794",
  "Elephant": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823ELWI-02_600x600.jpg?v=1709071743",
  "Rhino": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1833RHDB-03_600x600.jpg?v=1709071834",
  "Peony": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-03-27_at_6.36.47_PM_480x480.png?v=1711582653",
  "Koi": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1427KO-01_dfa0f2ae-1f37-4363-876b-2d2f84458059_480x480.jpg?v=1712076502",
  "Wave": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823WV-02_f4d0518c-200a-405e-b4be-2a81ee535527_480x480.jpg?v=1712076534",
  "Hydrangea": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-04-04_at_7.58.41_PM_480x480.png?v=1712278759",
  "Watermelon": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823WM-03_87e02f4b-982b-4df5-a159-503fec488676_480x480.jpg?v=1712708358",
  "Lemon": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1833LM-03_6f73529a-363f-4092-8876-6c80d18043c5_480x480.jpg?v=1712708357",
  "Popsicle": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-04-22_at_12.10.18_AM.png?v=1713762662",
  "Sakura Leopard": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823BLSK-02_480x480.jpg?v=1714167124",
  "Vintage Boats": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401VBO-01_73954067-37f8-4124-9465-6f697a7fb84b_480x480.jpg?v=1714532783",
  "Wasabi Rainbow": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413RBWA-01_584acce0-437e-441d-b76d-4e921291b503_480x480.jpg?v=1716770559",
  "Shark": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/2141MNSH-01_29ab5319-6eb0-483a-b7f6-d848a8503beb.jpg?v=1717545039",
  "Kite": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1833KI-02_c2d51b95-7408-48ad-8af4-bf5e04137f70.jpg?v=1718150539",
  "Pirate": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413PTPW-01_9957842a-fa6d-40d1-b771-a40bda84be4f_480x480.jpg?v=1718832243",
  "Mermaid": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413MELL-01_de8e2950-7c84-434e-935d-66bba5f6e94c_480x480.jpg?v=1718832198",
  "Horse": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-07-16_at_10.31.43_PM.png?v=1721187119",
  "Tractor": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1751TC_fc091fe4-dff8-4ede-9541-fe967d4684e7_480x480.jpg?v=1723347156",
  "Apple Orchard": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-08-14_at_3.18.46_PM.png?v=1723666742",
  "Football": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-08-21_at_9.33.51_PM_480x480.png?v=1724294065",
  "Trick or Treat": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413HWTT_f51ac57b-fd65-464c-959a-1d15da7bde3b_480x480.jpg?v=1724897816",
  "Spooky": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413HWSP_4aecf27e-81ec-4679-a67f-077fed76f680_480x480.jpg?v=1724897779",
  "Acorn": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-09-04_at_7.47.21_PM_480x480.png?v=1725497446",
  "Mushroom": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-09-04_at_7.46.52_PM_480x480.png?v=1725497446",
  "Petunia": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-09-07_at_8.38.23_PM_480x480.png?v=1725759561",
  "Sugar Plum": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-09-18_at_3.26.06_PM_480x480.png?v=1726691206",
  "Nutcracker": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2024-09-18_at_3.26.03_PM_480x480.png?v=1726691206",
  "Midnight Icon": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-09-23_at_3.19.35_PM_cc9449dc-38f8-44f9-b486-86b82612a7dc.png?v=1727142990",
  "Journey": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-09-23_at_3.19.25_PM_a282b361-da94-4a19-ba1b-b2cd0c5ff34f.png?v=1727142991",
  "Holiday Train": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-10-02_at_5.24.54_PM.png?v=1727907919",
  "Midnight Leopard": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413BLMD-01_83a07109-a4c2-42dd-bcac-668eda19dfb3.jpg?v=1728439735",
  "Midnight Lily": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823LIMD-03_3527537e-ff1b-4785-bd76-b414bbec81a0_480x480.jpg?v=1729132641",
  "Thyme Lily": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823LITY-03_6bf890fd-57b5-4f8e-b83b-85dcc92f70e6_480x480.jpg?v=1729132713",
  "Penguin": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-10-18_at_3.47.34_PM_480x480.png?v=1729284481",
  "Boho Tree": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-10-18_at_3.47.08_PM_480x480.png?v=1729284485",
  "Sakura Space": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-12-10_at_8.29.02_PM_480x480.png?v=1733884169",
  "Ice Space": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-12-10_at_8.29.58_PM_480x480.png?v=1733884207",

  // 2023 Prints
  "Strawberry": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823SB2_600x600.jpg?v=1672898470",
  "Cherry": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-12-27_at_3.45.37_PM_600x600.png?v=1703713617",
  "Blueberry": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-12-27_at_3.45.22_PM_600x600.png?v=1703713579",
  "Butterfly": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401BF1_600x600.jpg?v=1676495228",
  "Dragonfly": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401DR1_600x600.jpg?v=1676495268",
  "Crawl": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401CW1_600x600.jpg?v=1676495335",
  "Spring Egg": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1705EG02_600x600.jpg?v=1677031055",
  "Western": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/2141WN_600x600.jpg?v=1678248334",
  "Periwinkle Bluebonnet": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/2141BLPE_600x600.jpg?v=1678248241",
  "Coffee Rainbow": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401RBCF01_600x600.jpg?v=1678853396",
  "Hunter Rainbow": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401RBHU01_600x600.jpg?v=1678853624",
  "Crepe Rip Tide": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401RTCP01_600x600.jpg?v=1680050265",
  "Robin Rip Tide": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401RTRO01_600x600.jpg?v=1680050202",
  "Unicorn": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823UN02_600x600.jpg?v=1681266538",
  "Dragon": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823DG02_600x600.jpg?v=1681266496",
  "Lavender": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401LV01_600x600.jpg?v=1681788074",
  "Robin Cuddle": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401CURO01_971e669a-9285-4bcc-b3df-0dabb7e20c38_600x600.jpg?v=1682554193",
  "True North": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413TN_600x600.jpg?v=1682987027",
  "Frontier": "https://kytebaby.com/cdn/shop/files/1911FN01.jpg",
  "Liberty": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413LI_21ebe26f-cd45-486b-986b-0cc4a16d8b9b_600x600.jpg?v=1683081812",
  "Avocado": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401AV01_568a96f5-7813-48aa-91de-33b165f698ff_600x600.jpg?v=1684290013",
  "Peach": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401PH01_435c7561-2564-4c8b-a5b3-db2e463ffb99_600x600.jpg?v=1684290078",
  "Raspberry Shell": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-06-07_at_9.17.15_AM_600x600.png?v=1686147540",
  "Royal Shell": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-06-07_at_9.17.31_AM_600x600.png?v=1686147494",
  "Taro Leopard": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401BLTA01_c156a996-f5fb-47ee-a9ca-13107723dd68_600x600.jpg?v=1686708172",
  "Oat Leopard": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401BLOA01_1eb2c342-dd58-43db-9b53-a1bc1eb00e2c_600x600.jpg?v=1686708121",
  "Axolotl": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401AX01_600x600.jpg?v=1687375948",
  "Eagle Ray": "https://kytebaby.com/cdn/shop/files/1911ER01.jpg",
  "Macaw": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401MW01_600x600.jpg?v=1687375926",
  "Camping": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-07-03_at_10.54.24_PM_600x600.png?v=1688442914",
  "Sunflower": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-07-12_at_8.40.22_PM_600x600.png?v=1689212502",
  "Gryffindor": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401HPGR01_c99a6e14-0b68-4737-8e4b-d76d9b9573f5_600x600.jpg?v=1692146398",
  "Hufflepuff": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401HPHF01_3c33cf38-d022-447a-9ffe-eb4d27db8b7f_600x600.jpg?v=1692146438",
  "Ravenclaw": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401HPRC01_60968732-b57f-4f4f-9771-d33525102033_600x600.jpg?v=1692146509",
  "Slytherin": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401HPSY01_995d30aa-826d-4d33-9548-16685cc5cd6b_600x600.jpg?v=1692146639",
  "Boo": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413BO_61fd4cc8-57d1-4df0-bc87-4803aab0cd9e_600x600.jpg?v=1692758770",
  "Carve": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413CA_4a0a38a0-ff9a-4bbc-8c0e-4fab4e78eb0a_600x600.jpg?v=1692758951",
  "Spider": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413SD_8bef02f7-7033-4811-915d-59f89def9bcd_600x600.jpg?v=1692758872",
  "Trail": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413TL_4f4c27de-5782-4d64-9440-1f587ac15147_600x600.jpg",
  "Coastline": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1823CL02_6af42ac7-1d3d-4b01-b263-77515189f2f3_600x600.jpg?v=1693953936",
  "Midnight Poppies": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1833PPMD03_3a0c3425-06b1-4e49-ada6-26aed1c2a4c3_600x600.jpg?v=1694554170",
  "Cloud Poppies": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1833PPCD03_fcce0e63-afa1-48ad-96d4-d82047c1c2a8_600x600.jpg?v=1694554112",
  "Winterberry": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-09-19_at_11.03.34_PM_600x600.png?v=1695182947",
  "Mistletoe": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-09-19_at_11.03.51_PM_600x600.png?v=1695182886",
  "Midnight Plaid": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413PLMD_ceade0f1-3be9-4258-8def-88fe3e57c657_600x600.jpg?v=1695677482",
  "Fungi": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413FU01_600x600.jpg?v=1696450597",
  "Foliage": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413FL01_600x600.jpg?v=1696450635",
  "Cloud Party": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413PACD_4243028a-7a24-46f3-866b-907b13b5dfb1_600x600.jpg?v=1697054127",
  "Midnight Party": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413PAMD_55f5e182-88c5-4aeb-9718-750270cd6e38_600x600.jpg?v=1697054083",
  "Alpine Village": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413AP_c225c332-d7aa-493b-8aa0-1b340fcd69c6_600x600.jpg?v=1697507063",
  "Cloud Deer": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413DECD_9f14ca32-b833-4a9e-8c75-97fb4bcada19_600x600.jpg?v=1698192237",
  "Midnight Deer": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413DEMD_2792630e-bd53-4273-9e88-96d49ac88234_600x600.jpg?v=1698192283",
  "Blue Heron": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1502BH01_dc328bf2-a808-4df4-b104-05672e0ffcbd_600x600.jpg?v=1698850058",
  "Raccoon": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1502RC01_1b863dcc-15a2-46f7-8fe5-48722e6cda63_600x600.jpg?v=1698850118",
  "Espresso Herringbone": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413HBES01_154b22c7-f558-4bc0-93f3-99dcd5024f77_600x600.jpg?v=1699411046",
  "Dusty Rose Herringbone": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1413HBDU01_51cbe608-3ba2-40bd-82cf-04e3be036aa2_600x600.jpg?v=1699410994",
  "Sienna Woodland": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401WDSI01_6edf302e-8f86-4143-b0f9-e51c589b6311_600x600.jpg?v=1701900679",

  // 2023 Solids
  "Crepe": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-02-07_at_7.42.30_PM_600x600.png?v=1675820624",
  "Periwinkle": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-02-07_at_7.42.58_PM_600x600.png?v=1675820749",
  "Pistachio": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-06-04_at_11.55.15_PM_480x480.png?v=1685940957",
  "Robin": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-02-07_at_7.43.17_PM_600x600.png?v=1675820678",
  "Butter": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-02-07_at_7.40.20_PM_600x600.png?v=1675820477",
  "Caribbean": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-05-31_at_3.12.55_PM_600x600.png?v=1685564345",
  "Raspberry": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-06-04_at_11.56.38_PM_480x480.png?v=1685941012",
  "Royal": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-05-31_at_3.14.05_PM_600x600.png?v=1685564290",
  "Tangerine": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-06-04_at_11.57.39_PM_480x480.png?v=1685941073",
  "Dusty Rose": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/pantone-color-chip-18-1435-tpg_copy_600x600.jpg?v=1693339110",
  "Glacier": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/pantone-color-chip-15-4706-tpg_copy_600x600.jpg?v=1693339231",
  "Haze": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/pantone-color-chip-16-3907-tpx_copy_600x600.jpg?v=1693339338",
  "Sienna": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/pantone-color-chip-15-1429-tpg_copy_600x600.jpg?v=1693339178",
  "Forest": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/pantone-color-chip-19-6050-tpg_copy_600x600.jpg?v=1693339289",
  "Emerald": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Emerald_4f78eb5c-3e7e-4c10-afdd-5b4c5aa16b78_480x480.png?v=1657165502",

  // 2022 Prints
  "Spring 2022 Polka Dot": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Spring_Polka_Dot_Large_Swatch_fde09c71-a87c-4b39-8620-0aeaf3fce9f5_480x480.jpg?v=1645109085",
  "Fog Rainbow": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1427RBFO_1_240x240.jpg?v=1646698546",
  "Sunset Rainbow": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1832RBSS_1_480x480.jpg?v=1646699952",
  "Eucalyptus": "https://kytebaby.com/cdn/shop/files/1911EU_1.jpg",
  "Monstera": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401MT_1_480x480.jpg?v=1650478895",
  "Black and White Zen": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401BWZN_1_2_480x480.jpg?v=1650921131",
  "Firework": "https://u-mercari-images.mercdn.net/photos/m71141550371_2.jpg",
  "Camo": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1402COCV_1_480x480.jpg?v=1655230399",
  "Stream Shark": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1402SH_1_480x480.jpg?v=1655910891",
  "Midnight Herringbone": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1402HBMD_1_480x480.jpg?v=1657643841",
  "Khaki Herringbone": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1402HBKH_480x480.jpg?v=1657643944",
  "Chick": "https://kytebaby.com/cdn/shop/files/Chick.jpg",
  "Icon": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Icon_480x480.png?v=1663032129",
  "Herbology": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Herbology_480x480.png?v=1663032108",
  "Flight": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Flight_480x480.png?v=1663032088",
  "Wreath": "https://kytebaby.com/cdn/shop/files/1411WR_1.jpg",
  "Hunter Plaid": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Christmas_Plaid_SL_1_480x480.png?v=1664330573",
  "Marigold Cheetah": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Cheetah-2_480x480.jpg?v=1664590986",
  "Rust Tiger": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Tiger-2_480x480.jpg?v=1664590946",
  "Hunter Leopard": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Hunter_Leopard-2_480x480.jpg?v=1664591018",
  "Cove Antarctic": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Cove_Antarctic_8b041a14-c821-4a4a-98f9-d420e3decaeb_480x480.jpg?v=1666828164",
  "Arctic": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Arctic_480x480.jpg?v=1666827903",
  "Midnight Constellation": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Midnight_Constellation_480x480.png?v=1668396582",
  "Cloud Constellation": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Cloud_Constellation_480x480.png?v=1668396652",
  "Honey Bear": "https://kytebaby.com/cdn/shop/files/1411BE.jpg",
  "Small Midnight Magnolia": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/small_midnight_600x600.jpg?v=1670475585",
  "Small Khaki Magnolia": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/small_khaki_600x600.jpg?v=1670475580",
  "Big Midnight Magnolia": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/big_midnight_600x600.jpg?v=1670475782",
  "Big Khaki Magnolia": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/big_khaki_600x600.jpg?v=1670475869",
  "Crepe Hearts": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/crepe_heart_05e3c418-de9b-434e-b0fd-1f9aeb53be12_600x600.jpg?v=1672270277",
  "Robin Hearts": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/robin_hearts_600x600.jpg?v=1672270395",

  // 2022 Solids
  "Stream": "https://www.blossom.baby/wp-content/uploads/2022/03/kyte-baby-crib-sheet-stream-twin-sheet-twin-sheet-in-stream-30681517785199_1800x1800-800x800.jpg",
  "Fern": "https://www.blossom.baby/wp-content/uploads/2022/03/kyte-baby-crib-sheet-fern-crib-sheet-crib-sheet-in-fern-30676756955247_1800x1800-800x800.jpg",
  "Daffodil": "https://kytebaby.com/cdn/shop/files/Daffodil.jpg",
  "Rose": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Rose_Large_Swatch_480x480.jpg?v=1645110901",
  "Taro": "https://kytebaby.com/cdn/shop/files/kyte-baby-crib-sheet-taro-crib-sheet-crib-sheet-in-taro-34064133783663.jpg?v=1718780114",
  "Khaki": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1402KH_1_480x480.jpg?v=1654569052",
  "Palm": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1402PM_1_480x480.jpg?v=1654569143",
  "Cove": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1402CV_1_480x480.jpg?v=1654568914",
  "Hunter": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Hunter_480x480.png?v=1657213717",
  "Porcelain": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Porcelain_480x480.png?v=1657213758",
  "Marigold": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Marigold_480x480.png?v=1657213826",
  "Rust": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Rust_7b746c94-aae7-4a55-9d37-6c599ca2d68e_480x480.png?v=1660182652",
  "Coffee": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Coffee_480x480.png?v=1657213791",

  // 2021 Prints & Solids
  "Giraffe": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/3ED085FD-C095-4D81-87F5-C24117C8DD19_600x600.jpg?v=1614559471",
  "Aloe Rainbow": "https://kytebaby.com/cdn/shop/files/kyte-baby-zippered-footies-printed-zippered-footie-in-aloe-rainbow-29896752595055.jpg",
  "Clementine Rainbow": "https://kytebaby.com/cdn/shop/files/kyte-baby-zippered-footies-printed-zippered-footie-in-clementine-rainbow-30389785362543.jpg",
  "Snowflake": "https://kytebaby.com/cdn/shop/files/Snowflake.jpg",
  "Metallic Rainbow": "https://kytebaby.com/cdn/shop/files/Metallic_Rainbow.jpg",
  "Bubblegum": "https://kytebaby.com/cdn/shop/files/Bubblegum.jpg",
  "Indigo": "https://kytebaby.com/cdn/shop/files/Indigo.jpg",
  "Jade": "https://kytebaby.com/cdn/shop/files/Jade.jpg",
  "Lagoon": "https://kytebaby.com/cdn/shop/files/Lagoon.jpg",
  "Melon": "https://kytebaby.com/cdn/shop/files/Melon.jpg",
  "Sunset": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Sunset_480x480.png?v=1657211358",
  "Wheat": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-02-17_at_1.42.43_PM.png?v=1739821372",
  "Fog": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-06-04_at_11.46.10_PM_480x480.png?v=1685940415",
  "Dahlia": "https://kytebaby.com/cdn/shop/files/Dahlia.jpg",
  "Olive": "https://kytebaby.com/cdn/shop/files/Olive.jpg",
  "Nutmeg": "https://kytebaby.com/cdn/shop/files/Nutmeg.jpg",
  "Clementine": "https://kytebaby.com/cdn/shop/files/Clementine.jpg",
  "Eggplant": "https://kytebaby.com/cdn/shop/files/Eggplant.jpg",
  "Fall 2021 Polka Dot": "https://www.blossom.baby/wp-content/uploads/2022/02/kyte-baby-crib-sheet-fall-polka-dot-crib-sheet-printed-crib-sheet-in-fall-polka-dot-30464147914863_1800x1800-800x800.jpg",

  // 2020 and earlier
  "Charcoal": "https://www.blossom.baby/wp-content/uploads/2023/01/kyte-baby-baby-blanket-charcoal-infant-1-0-tog-baby-blanket-in-charcoal-14444583288943-800x800.jpg",
  "Kiwi": "https://kytebaby.com/cdn/shop/files/Kiwi.jpg",
  "Orchid": "https://kytebaby.com/cdn/shop/files/Orchid.jpg",
  "Ruby": "https://kytebaby.com/cdn/shop/files/Ruby.jpg",
  "Mulberry": "https://kytebaby.com/cdn/shop/files/Mulberry.jpg",
  "Sapphire": "https://kytebaby.com/cdn/shop/files/Sapphire.jpg",
  "Sage": "https://kytebaby.com/cdn/shop/files/1803SG102_1300x.jpg?v=1765450481",
  "Blush": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Blush_eeb63a10-908d-4ea7-9955-6ee4f2e444df_480x480.png?v=1657211269",
  "Oat": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-06-04_at_11.39.33_PM_480x480.png?v=1685940030",
  "Midnight": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/MIDNIGHT_480x480.jpg?v=1652219265",
  "Cloud": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-06-04_at_11.37.14_PM_480x480.png?v=1685939855",
  "Navy": "https://cdn.shopify.com/s/files/1/0019/7106/0847/products/kyte-baby-crib-sheet-navy-crib-sheet-crib-sheet-in-navy-30221076103279_3000x.jpg?v=1762184125",
  "Storm": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-06-04_at_11.52.57_PM_480x480.png?v=1685940801",
  "Slate": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screen_Shot_2023-06-04_at_11.47.49_PM_480x480.png?v=1685940506",
  "Steel": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1406SE_1_480x480.jpg?v=1652318536",
  "Snow": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1604SN_1_1_480x480.jpg?v=1652317830",
  "Azure": "https://kytebaby.com/cdn/shop/files/Azure.jpg",
  "Aqua": "https://kytebaby.com/cdn/shop/files/Aqua.jpg",
  "Mauve": "https://kytebaby.com/cdn/shop/files/Mauve.jpg",
  "Sage Rip Tide": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/1401RTSG_1_480x480.jpg?v=1647703573",
  "Taro Rip Tide": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Taro_Rip_Tide_480x480.jpg?v=1660184015",

  // Additional prints from clearance doc
  "Irish": "https://kytebaby.com/cdn/shop/files/1411IR.jpg",
  "Bunny": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Bunny_BN_600x600.jpg?v=1677383408",
  "Prickle": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2024-10-16_at_9.34.02_PM_480x480.png?v=1729132453",
  "Rust Rainbow on Midnight": "https://kentfieldkids.com/cdn/shop/products/kyte_rustrainbow_midnight_e6c0ba4c-d436-40ad-93b5-42c6a243bcb7.jpg?v=1667059039",
  "Rust Rainbow on Oat": "https://kentfieldkids.com/cdn/shop/products/kyte_rustrainbow_oat.jpg?v=1667058837",
  "Superman": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Screenshot_2025-07-21_at_1.27.39_PM.png?v=1753123146",
  "Antarctic": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/Cove_Antarctic_8b041a14-c821-4a4a-98f9-d420e3decaeb_480x480.jpg?v=1666828164",
  "Seagull": "https://cdn.shopify.com/s/files/1/0019/7106/0847/files/2141MNSG-01_b1fa7ca4-d888-4225-9c99-bd78840b231a_480x480.jpg?v=1717545094",
};

// Function to get a print image URL
export function getPrintImageUrl(printName: string): string | undefined {
  // Try exact match first
  if (printDatabase[printName]) {
    return printDatabase[printName];
  }

  // Try case-insensitive match
  const normalizedName = printName.trim();
  const key = Object.keys(printDatabase).find(
    k => k.toLowerCase() === normalizedName.toLowerCase()
  );

  if (key) {
    return printDatabase[key];
  }

  // Try partial match for variations (e.g., "Aloe Chick" might be listed as "Aloe Chick*")
  const cleanName = normalizedName.replace(/\*$/, '').trim();
  const partialKey = Object.keys(printDatabase).find(
    k => k.toLowerCase() === cleanName.toLowerCase()
  );

  return partialKey ? printDatabase[partialKey] : undefined;
}

// Get all available prints
export function getAllPrints(): PrintInfo[] {
  return Object.entries(printDatabase).map(([name, imageUrl]) => ({
    name,
    imageUrl
  }));
}
