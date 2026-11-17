/* নমুনা তথ্য। খাবারের নাম ও কিছু দাম গ্রাহকের দেওয়া মেনু কার্ড ও পেজের পোস্ট থেকে; `est:1` চিহ্নিত দামগুলো শুধু প্রদর্শনের জন্য ধরা নমুনা। */
var VERSION = 'ডিজাইন প্রিভিউ v0.1 · ১৭ নভেম্বর ২০২৬';
var ORG = { name:'Ember Essence', tag:'Igniting Flavors, Creating Memories.', phone:'01805-539374', email:'emberessence2.0@gmail.com',
  addrBn:'রোড নং ০৫, লেন-০৬, এল-ব্লক, আগ্রাবাদ এক্সেস রোড, হালিশহর, চট্টগ্রাম', addrEn:'Road 05, Lane 06, L-Block, Agrabad Access Road, Halishahar, Chattogram',
  hoursBn:'প্রতিদিন দুপুর ২টা – রাত ২টা', hoursEn:'Daily 2:00 PM – 2:00 AM' };

var CATS = [
  {id:'platter',bn:'প্ল্যাটার ও গ্রিল',en:'Platters & Grill',img:'jamaican'},
  {id:'smoke',bn:'এম্বার স্মোক কাবাব',en:'Ember Smoke Kabab',img:'kabab'},
  {id:'steak',bn:'স্টেক',en:'Steak',img:'steak'},
  {id:'seafood',bn:'সি-ফুড',en:'Seafood',img:'seafood-blast'},
  {id:'curry',bn:'কারি',en:'Curry',img:'curry'},
  {id:'starter',bn:'স্টার্টার ও পিৎজা',en:'Starters & Pizza',img:'appetizer-fiesta'},
  {id:'soup',bn:'স্যুপ ও সবজি',en:'Soup & Vegetable',img:'soup'},
  {id:'dessert',bn:'ডেজার্ট',en:'Dessert',img:'waffle'},
  {id:'drinks',bn:'পানীয়',en:'Drinks',img:'mojito'}
];
var HF = (h,f)=>[{bn:'হাফ',en:'Half',p:h},{bn:'ফুল',en:'Full',p:f}];
var AD = { rice:{bn:'অতিরিক্ত স্পেশাল রাইস',en:'Extra special rice',p:80}, sauce:{bn:'অতিরিক্ত সস',en:'Extra sauce',p:30}, cheese:{bn:'অতিরিক্ত চিজ',en:'Extra cheese',p:60}, fries:{bn:'ফ্রেঞ্চ ফ্রাই',en:'French fries',p:90}, ice:{bn:'আইসক্রিম স্কুপ',en:'Ice cream scoop',p:70} };
// [id, cat, en, bn, price, img, descEn, descBn, opts]
var MENU_SEED = [
 ['m01','platter','Jamaican Grill Chicken','জ্যামাইকান গ্রিল চিকেন',520,'jamaican','Grilled chicken with special rice and sautéed mushroom.','স্পেশাল রাইস ও সতে মাশরুমের সঙ্গে গ্রিল করা চিকেন।',{est:1,ad:['rice','sauce'],feat:1}],
 ['m02','platter','Peri Peri Chicken','পেরি পেরি চিকেন',480,'peri-peri','Peri peri chicken, special fried rice and sautéed vegetables.','পেরি পেরি চিকেন, স্পেশাল ফ্রাইড রাইস ও সতে সবজি।',{est:1,ad:['rice','sauce']}],
 ['m03','platter','Chicken Steak Meal','চিকেন স্টেক মিল',490,'chicken-steak','Chicken steak with rice, salad and grilled vegetables.','রাইস, সালাদ ও গ্রিল সবজিসহ চিকেন স্টেক।',{est:1,ad:['rice','sauce'],feat:1}],
 ['m04','platter','Mexican Grilled Platter','মেক্সিকান গ্রিলড প্ল্যাটার',650,'mexican-platter','Grilled chicken platter with Mexican rice and vegetables.','মেক্সিকান রাইস ও সবজিসহ গ্রিলড চিকেন প্ল্যাটার।',{est:1,ad:['rice','sauce']}],
 ['m05','platter','Moroccan Chicken','মরোক্কান চিকেন',690,'moroccan','Yellow butter rice, Moroccan grilled chicken, grilled shrimp and sautéed vegetables.','ইয়েলো বাটার রাইস, মরোক্কান গ্রিলড চিকেন, গ্রিলড চিংড়ি ও সতে সবজি।',{est:1,ad:['rice','sauce'],feat:1}],
 ['m06','smoke','Afghani Beef Kabab','আফগানি বিফ কাবাব',490,'kabab','Smoky charcoal beef kabab with salad and chutney.','কয়লার ধোঁয়ায় তৈরি বিফ কাবাব, সালাদ ও চাটনিসহ।',{feat:1}],
 ['m07','smoke','Beef Boti Kabab','বিফ বটি কাবাব',520,'kabab','Tender beef boti from the charcoal grill.','কয়লার গ্রিলে নরম বিফ বটি।',{}],
 ['m08','smoke','Chicken Tandoori Kabab','চিকেন তন্দুরি কাবাব',250,'kabab','Classic tandoori chicken kabab.','ক্লাসিক তন্দুরি চিকেন কাবাব।',{}],
 ['m09','smoke','Chicken Reshmi Kabab','চিকেন রেশমি কাবাব',420,'kabab','Creamy, mild reshmi kabab.','ক্রিমি ও হালকা মসলার রেশমি কাবাব।',{}],
 ['m10','smoke','Fish Tikka Kabab','ফিশ টিক্কা কাবাব',480,'kabab','Marinated fish tikka, grilled.','মেরিনেট করা ফিশ টিক্কা, গ্রিল করা।',{}],
 ['m11','steak','Rump Steak','রাম্প স্টেক',1100,'steak','Grilled steak with mashed potato or special rice, sautéed vegetable and mushroom sauce.','ম্যাশড পটেটো বা স্পেশাল রাইস, সতে সবজি ও মাশরুম সসসহ গ্রিলড স্টেক।',{ad:['sauce','fries']}],
 ['m12','steak','T-Bone Steak','টি-বোন স্টেক',1750,'steak-board','Grilled T-bone with mashed potato or special rice and mushroom sauce.','ম্যাশড পটেটো বা স্পেশাল রাইস ও মাশরুম সসসহ গ্রিলড টি-বোন।',{ad:['sauce','fries'],feat:1}],
 ['m13','steak','Rib Eye Steak','রিব আই স্টেক',1550,'steak','Grilled rib eye with mashed potato or special rice.','ম্যাশড পটেটো বা স্পেশাল রাইসসহ গ্রিলড রিব আই।',{ad:['sauce','fries']}],
 ['m14','seafood','Seafood Blast','সি-ফুড ব্লাস্ট',890,'seafood-blast','Grilled prawns, seafood rice, cheesy prawns and sautéed vegetables.','গ্রিলড চিংড়ি, সি-ফুড রাইস, চিজি চিংড়ি ও সতে সবজি।',{est:1,ad:['rice','sauce'],feat:1}],
 ['m15','seafood','Grilled Red Snapper','গ্রিলড রেড স্ন্যাপার',950,'red-snapper','Whole grilled snapper with seafood rice and sautéed vegetables.','আস্ত গ্রিলড স্ন্যাপার, সি-ফুড রাইস ও সতে সবজিসহ।',{est:1,ad:['rice','sauce']}],
 ['m16','seafood','Sea-Food Combo','সি-ফুড কম্বো',1890,'seafood-combo','Lemon butter dory, fried calamari, tiger prawn, red snapper, special rice, vegetables and fries.','লেমন বাটার ডোরি, ফ্রাইড ক্যালামারি, টাইগার প্রন, রেড স্ন্যাপার, স্পেশাল রাইস, সবজি ও ফ্রাই।',{est:1,combo:1}],
 ['m17','seafood','Fish & Chips','ফিশ অ্যান্ড চিপস',450,'fish-chips','Crispy fish fillet with fries and dip.','মুচমুচে ফিশ ফিলে, ফ্রাই ও ডিপসহ।',{est:1,ad:['sauce']}],
 ['m18','seafood','Manchurian Prawn','মাঞ্চুরিয়ান প্রন',550,'prawn','Prawns in Manchurian sauce.','মাঞ্চুরিয়ান সসে চিংড়ি।',{v:HF(350,550)}],
 ['m19','curry','Chicken Butter Masala','চিকেন বাটার মাসালা',490,'curry','Rich, buttery chicken curry.','ঘন বাটার গ্রেভির চিকেন কারি।',{feat:1}],
 ['m20','curry','Beef Bhuna','বিফ ভুনা',540,'curry','Slow-cooked beef bhuna.','ধীরে কষানো বিফ ভুনা।',{}],
 ['m21','curry','Mutton Rezala','মাটন রেজালা',580,'curry','Mutton rezala in a mild white gravy.','হালকা সাদা গ্রেভিতে মাটন রেজালা।',{}],
 ['m22','curry','Beef Chilli Dry','বিফ চিলি ড্রাই',590,'beef','Crispy beef tossed with chilli.','মরিচে টস করা মুচমুচে বিফ।',{v:HF(390,590)}],
 ['m23','starter','Appetizer Fiesta','অ্যাপেটাইজার ফিয়েস্তা',750,'appetizer-fiesta','Sharing board of wings, fried chicken, calamari and fries.','উইংস, ফ্রাইড চিকেন, ক্যালামারি ও ফ্রাইয়ের শেয়ারিং বোর্ড।',{est:1,combo:1,feat:1}],
 ['m24','starter','Deluxe Starter Combo','ডিলাক্স স্টার্টার কম্বো',890,'deluxe-combo','A bigger starter board for the table.','টেবিলের জন্য বড় স্টার্টার বোর্ড।',{est:1,combo:1}],
 ['m25','starter','Mexican Beef Nachos','মেক্সিকান বিফ নাচোস',420,'nachos','Nachos with beef, cheese sauce and olives.','বিফ, চিজ সস ও অলিভসহ নাচোস।',{est:1,ad:['cheese']}],
 ['m26','starter',"Ember's Roll",'এম্বারস রোল',320,'roll','Wraps served with fries and dips.','ফ্রাই ও ডিপসহ র‍্যাপ।',{est:1,ad:['cheese','sauce']}],
 ['m27','starter','Ember De Polo Pizza','এম্বার ডি পোলো পিৎজা',690,'pizza-polo',"Chef's special pizza with dips in the centre.",'মাঝখানে ডিপসহ শেফের স্পেশাল পিৎজা।',{est:1,v:[{bn:'৯ ইঞ্চি',en:'9 inch',p:690},{bn:'১২ ইঞ্চি',en:'12 inch',p:990}],ad:['cheese']}],
 ['m28','starter','1 Pizza 4 Flavours','এক পিৎজায় চার স্বাদ',850,'pizza-four','One pizza, four different flavours.','একটি পিৎজায় চারটি আলাদা স্বাদ।',{est:1,v:[{bn:'১২ ইঞ্চি',en:'12 inch',p:850},{bn:'১৪ ইঞ্চি',en:'14 inch',p:1090}],ad:['cheese']}],
 ['m29','soup','ChimiChanga','চিমিচাঙ্গা',450,'soup','Special cream sauce, chicken, mushroom and capsicum in a tortilla bowl.','টরটিলা বোলে স্পেশাল ক্রিম সস, চিকেন, মাশরুম ও ক্যাপসিকাম।',{}],
 ['m30','soup','Cream of Chicken Soup','ক্রিম অব চিকেন স্যুপ',350,'soup','Rich creamy soup with garlic butter bread.','গার্লিক বাটার ব্রেডসহ ঘন ক্রিমি স্যুপ।',{}],
 ['m31','soup','Chicken Vegetable','চিকেন ভেজিটেবল',490,'veg','Stir-fried vegetables with chicken.','চিকেনসহ ভাজা সবজি।',{v:HF(290,490)}],
 ['m32','dessert','Waffle with Ice Cream','ওয়াফল উইথ আইসক্রিম',350,'waffle','Chocolate, vanilla, strawberry or mango.','চকলেট, ভ্যানিলা, স্ট্রবেরি বা ম্যাঙ্গো।',{ad:['ice'],feat:1}],
 ['m33','dessert','Sizzling Brownie with Ice Cream','সিজলিং ব্রাউনি উইথ আইসক্রিম',350,'waffle','Hot brownie on a sizzler with ice cream.','গরম সিজলারে ব্রাউনি ও আইসক্রিম।',{ad:['ice']}],
 ['m34','drinks','Virgin Mojito','ভার্জিন মোহিতো',280,'mojito','Mint, lime and soda.','পুদিনা, লেবু ও সোডা।',{}],
 ['m35','drinks','Fresh Juice','ফ্রেশ জুস',250,'juice','Apple, orange, mango, grape or papaya.','আপেল, কমলা, আম, আঙুর বা পেঁপে।',{}],
 ['m36','drinks','KIT-KAT Shake','কিট-ক্যাট শেক',280,'shake','Thick chocolate wafer shake.','ঘন চকলেট ওয়েফার শেক।',{}],
 ['m37','drinks','Chocolate Cold Coffee','চকলেট কোল্ড কফি',250,'cold-coffee','Cold coffee with chocolate.','চকলেটসহ কোল্ড কফি।',{}],
 ['m38','drinks','Hot Coffee Regular','হট কফি রেগুলার',149,'coffee','Regular hot coffee.','রেগুলার গরম কফি।',{}],
 ['m39','drinks','Water 500ml','পানি ৫০০ মি.লি.',20,'','Bottled water.','বোতলজাত পানি।',{}]
];
// কাঁচামাল: [id, নাম, একক, স্টক, ন্যূনতম, একক মূল্য]
var ING_SEED = [
 ['chicken','মুরগি','কেজি',38,15,260],['beef','গরুর মাংস','কেজি',22,10,780],['mutton','খাসির মাংস','কেজি',6,5,1150],['prawn','চিংড়ি','কেজি',9,8,950],
 ['fish','মাছ (স্ন্যাপার/ডোরি)','কেজি',12,6,620],['rice','বাসমতি চাল','কেজি',64,25,190],['potato','আলু','কেজি',40,15,35],['flour','ময়দা','কেজি',30,10,65],
 ['cheese','মোজারেলা চিজ','কেজি',5,6,880],['oil','সয়াবিন তেল','লিটার',45,20,175],['veg','মিশ্র সবজি','কেজি',18,10,70],['spice','মসলা মিক্স','কেজি',8,3,640],
 ['milk','দুধ','লিটার',24,10,95],['cream','কুকিং ক্রিম','লিটার',7,4,420],['fruit','তাজা ফল','কেজি',14,8,180],['sugar','চিনি','কেজি',20,8,135],
 ['coffee','কফি বিনস','কেজি',3,2,1400],['water','পানি ৫০০ মি.লি.','পিস',180,60,12]
];
var RECIPE = { // প্রতি পরিবেশনে কাঁচামাল (নমুনা)
 platter:{chicken:.3,rice:.15,veg:.1,spice:.02,oil:.03}, smoke:{beef:.22,spice:.025,veg:.05,oil:.02}, steak:{beef:.35,potato:.2,veg:.1,cream:.04,oil:.02},
 seafood:{prawn:.18,fish:.2,rice:.15,veg:.1,oil:.04}, curry:{chicken:.25,spice:.03,oil:.05,cream:.03}, starter:{chicken:.2,flour:.15,cheese:.08,potato:.15,oil:.08},
 soup:{chicken:.1,cream:.08,veg:.1,milk:.1}, dessert:{flour:.1,milk:.1,sugar:.05,cream:.05}, drinks:{fruit:.2,sugar:.03,milk:.05},
 m07:{beef:.25,spice:.025,veg:.05,oil:.02}, m08:{chicken:.25,spice:.02,oil:.02}, m09:{chicken:.25,cream:.04,spice:.02}, m10:{fish:.25,spice:.02,oil:.02},
 m12:{beef:.5,potato:.2,veg:.1,cream:.04,oil:.02}, m16:{prawn:.3,fish:.5,rice:.3,potato:.2,veg:.2,oil:.1}, m20:{beef:.25,spice:.03,oil:.05}, m21:{mutton:.25,spice:.03,cream:.04,oil:.04},
 m22:{beef:.25,veg:.08,oil:.06,spice:.02}, m37:{coffee:.02,milk:.2,sugar:.03}, m38:{coffee:.015,milk:.08,sugar:.01}, m39:{water:1}, m18:{prawn:.25,veg:.08,oil:.05,spice:.02}
};
var STAFF_SEED = [ // কাল্পনিক নাম ও নম্বর — বাস্তব ব্যক্তি নয়
 ['s1','রফিকুল আলম','ম্যানেজার','manager',50000,'সকাল'],['s2','শেফ আনোয়ার','প্রধান শেফ','kitchen',55000,'সন্ধ্যা'],['s3','মিজানুর','শেফ','kitchen',37000,'সকাল'],['s4','জসিম','কুক','kitchen',29000,'সন্ধ্যা'],
 ['s5','তানিয়া আক্তার','ক্যাশিয়ার (কাউন্টার ১)','cashier',22000,'সকাল'],['s6','সোহেল রানা','ক্যাশিয়ার (কাউন্টার ২)','cashier',22000,'সন্ধ্যা'],
 ['s7','রাকিব','ওয়েটার','waiter',18000,'সকাল'],['s8','ইমন','ওয়েটার','waiter',18000,'সন্ধ্যা'],['s9','সাব্বির','ওয়েটার','waiter',18000,'সন্ধ্যা'],['s10','নুরুল','কিচেন সহকারী','kitchen',16000,'সকাল']
];
var SUP_SEED = [['p1','মেসার্স কর্ণফুলী মিট','মাংস','01700-000101',68000],['p2','হালিশহর ফ্রেশ ভেজ','সবজি ও ফল','01700-000102',22500],['p3','বন্দর সি-ফুড','মাছ ও চিংড়ি','01700-000103',45500],['p4','আগ্রাবাদ গ্রোসারি','মুদি ও দুগ্ধ','01700-000104',12000]];
var CUST_SEED = [ // কাল্পনিক
 ['c1','নমুনা গ্রাহক ১','01700-000201',14,18650,1,'হালিশহর'],['c2','নমুনা গ্রাহক ২','01700-000202',9,11200,1,'আগ্রাবাদ'],['c3','নমুনা গ্রাহক ৩','01700-000203',6,7480,0,'হালিশহর'],
 ['c4','নমুনা গ্রাহক ৪','01700-000204',3,3950,1,'বন্দর'],['c5','নমুনা গ্রাহক ৫','01700-000205',21,29800,1,'হালিশহর'],['c6','নমুনা গ্রাহক ৬','01700-000206',1,890,0,'আগ্রাবাদ']
];
var AREAS = [{id:'hali',bn:'হালিশহর',en:'Halishahar',fee:0},{id:'agra',bn:'আগ্রাবাদ',en:'Agrabad',fee:40},{id:'other',bn:'অন্যান্য এলাকা (নমুনা)',en:'Other area (sample)',fee:80}];
var ROLES = {owner:'মালিক',manager:'ম্যানেজার',cashier:'ক্যাশিয়ার',waiter:'ওয়েটার',kitchen:'রান্নাঘর'};
var PERMS = [ // [কাজ, মালিক, ম্যানেজার, ক্যাশিয়ার, ওয়েটার, রান্নাঘর]
 ['ড্যাশবোর্ড ও রিপোর্ট দেখা',1,1,0,0,0],['পিওএসে বিল ও পেমেন্ট',1,1,1,0,0],['ছাড় দেওয়া (সীমার মধ্যে)',1,1,1,0,0],['প্রকাশিত বিল বাতিল/সংশোধন',1,1,0,0,0],['টেবিলে অর্ডার নেওয়া',1,1,1,1,0],
 ['রান্নাঘরের অবস্থা পরিবর্তন',1,1,0,0,1],['মেনু, মূল্য ও রেসিপি',1,1,0,0,0],['স্টক, ক্রয় ও সরবরাহকারী',1,1,0,0,0],['কর্মী, হাজিরা ও বেতন',1,1,0,0,0],['হিসাব ও আর্থিক প্রতিবেদন',1,0,0,0,0],
 ['পেমেন্ট গেটওয়ে সেটিংস',1,0,0,0,0],['মার্কেটিং ও গ্রাহক তথ্য',1,1,0,0,0],['ব্যবহারকারী ও ভূমিকা',1,0,0,0,0]
];
var MODULES = [
 ['M01','প্রয়োজন বিশ্লেষণ ও সফটওয়্যার পরিকল্পনা',12000,15,'পরিধি, ব্যবহারকারী ও কার্যপ্রবাহের নথি',[['plan','পরিকল্পনা নথি']]],
 ['M02','মূল প্ল্যাটফর্ম ও নিরাপত্তা',25000,15,'ব্যবহারকারী, ভূমিকা, সেটিংস, ইতিহাস, ব্যাকআপ',[['admin-users','ব্যবহারকারী ও নিরাপত্তা']]],
 ['M03','গ্রাহকের ওয়েবসাইট',15000,15,'হোম, মেনু, অফার, গ্যালারি, রিজার্ভেশন, পরিচিতি, যোগাযোগ',[['site-home','ওয়েবসাইট'],['admin-reserve','রিজার্ভেশন তালিকা']]],
 ['M04','অনলাইন অর্ডার ও গ্রাহক অ্যাপ',25000,30,'মেনু, কার্ট, চেকআউট, অর্ডারের অবস্থা, ইতিহাস',[['app-menu','গ্রাহক অ্যাপ']]],
 ['M05','পিওএস ও বিলিং',40000,30,'অর্ডার, টেবিল, ছাড়, বিল ভাগ, শিফট, রসিদ',[['pos','পিওএস']]],
 ['M06','ওয়েটার অ্যাপ',12000,30,'টেবিল, অর্ডার, রান্নাঘরে পাঠানো, বিলের অনুরোধ',[['waiter','ওয়েটার প্যানেল']]],
 ['M07','রান্নাঘরের ডিসপ্লে ও কিচেন টিকিট',13000,30,'নতুন, চলছে, প্রস্তুত; টাইমার; KOT',[['kds','রান্নাঘরের ডিসপ্লে']]],
 ['M08','মেনু, রেসিপি ও খাবারের খরচ',10000,15,'বিভাগ, খাবার, ভ্যারিয়েন্ট, কম্বো, রেসিপি, খরচ',[['admin-menu','মেনু ও রেসিপি']]],
 ['M09','ইনভেন্টরি ও স্টক',18000,45,'কাঁচামাল, প্রবেশ/বের, অপচয়, সতর্কতা, গণনা',[['admin-stock','ইনভেন্টরি']]],
 ['M10','ক্রয় ও সরবরাহকারী',10000,45,'সরবরাহকারী, ক্রয়াদেশ, মাল গ্রহণ, পাওনা',[['admin-purchase','ক্রয়']]],
 ['M11','কর্মী ও মানবসম্পদ',12000,45,'প্রোফাইল, হাজিরা, শিফট, বেতন, অগ্রিম',[['admin-hr','কর্মী']]],
 ['M12','হিসাব ও অর্থ ব্যবস্থাপনা',25000,45,'খাত, ভাউচার, লেনদেন, লাভ-ক্ষতি, ব্যালান্স শিট, ভ্যাট',[['admin-accounts','হিসাব']]],
 ['M13','পেমেন্ট গেটওয়ে সংযোগ',10000,45,'বিকাশ ও নগদ, লেনদেন, মিলানো',[['admin-payments','পেমেন্ট']]],
 ['M14','মার্কেটিং ও গ্রাহক সম্পর্ক',10000,45,'গ্রাহক, এসএমএস খসড়া, কুপন, লয়্যালটি, মতামত',[['admin-crm','মার্কেটিং']]],
 ['M15','মালিকের ড্যাশবোর্ড ও রিপোর্ট',10000,45,'বিক্রির সারসংক্ষেপ, চার্ট, জনপ্রিয় খাবার, রপ্তানি',[['admin-dashboard','ড্যাশবোর্ড']]],
 ['M16','স্থাপন, পরীক্ষা ও প্রশিক্ষণ',13000,45,'পর্যালোচনা, তথ্য আমদানি, নির্দেশিকা, প্রশিক্ষণ, হস্তান্তর',[['handover','হস্তান্তর নথি']]]
];
var IMG_CREDIT = 'সব ছবি Ember Essence-এর নিজস্ব ফেসবুক পোস্ট ও মেনু কার্ড থেকে, গ্রাহকের দেওয়া ফাইল থেকে নেওয়া।';

function seed(){
  const now = Date.now(), m = x => now - x*60000;
  const menu = MENU_SEED.map(a=>Object.assign({id:a[0],cat:a[1],en:a[2],bn:a[3],price:a[4],img:a[5],den:a[6],dbn:a[7],avail:true},a[8]));
  const it = (id,q,note,vi)=>{const x=menu.find(i=>i.id===id);const v=x.v&&x.v[vi==null?x.v.length-1:vi];return {mid:id,name:x.bn+(v?' ('+v.bn+')':''),en:x.en,qty:q,price:v?v.p:x.price,note:note||''}};
  const orders = [
   {id:'EE-1041',type:'dine',table:'T2',src:'waiter',waiter:'রাকিব',items:[it('m01',2),it('m34',2),it('m30',1)],k:'served',t:m(52),tk:m(50),tr:m(36),paid:false,billReq:true},
   {id:'EE-1042',type:'dine',table:'T5',src:'waiter',waiter:'ইমন',items:[it('m12',1,'মিডিয়াম ওয়েল'),it('m19',1),it('m36',2)],k:'cooking',t:m(11),tk:m(9),paid:false},
   {id:'EE-1043',type:'online',src:'app',cust:{name:'নমুনা গ্রাহক ২',phone:'01700-000202',addr:'আগ্রাবাদ (নমুনা ঠিকানা)'},area:'agra',delivery:40,items:[it('m23',1),it('m28',1,'কম ঝাল',0)],k:'new',t:m(3),paid:true,pay:[{m:'বিকাশ',a:0}],gw:'bkash'},
   {id:'EE-1044',type:'takeaway',src:'pos',items:[it('m26',2),it('m35',2)],k:'ready',t:m(19),tk:m(17),tr:m(4),paid:true,pay:[{m:'নগদ টাকা',a:0}],cashier:'তানিয়া আক্তার'},
   {id:'EE-1045',type:'dine',table:'T8',src:'waiter',waiter:'সাব্বির',items:[it('m14',2),it('m16',1),it('m37',3,'চিনি কম')],k:'new',t:m(18),paid:false}
  ];
  // আজকের আগের পরিশোধিত বিল (ড্যাশবোর্ডের জন্য)
  const hist=[['EE-1031',[['m05',2],['m34',2]],'dine','T3',310,'নগদ টাকা','তানিয়া আক্তার','রাকিব'],['EE-1032',[['m11',1],['m32',1]],'dine','T1',268,'বিকাশ','তানিয়া আক্তার','রাকিব'],['EE-1033',[['m23',1],['m27',1]],'takeaway',null,241,'নগদ','তানিয়া আক্তার',''],
   ['EE-1034',[['m19',2],['m08',2],['m39',2]],'dine','T6',214,'নগদ টাকা','তানিয়া আক্তার','ইমন'],['EE-1035',[['m14',1],['m15',1]],'online',null,176,'বিকাশ','',''],['EE-1036',[['m03',3],['m35',3]],'dine','T4',139,'নগদ টাকা','সোহেল রানা','সাব্বির'],
   ['EE-1037',[['m25',2],['m36',2]],'takeaway',null,121,'নগদ','সোহেল রানা',''],['EE-1038',[['m12',1],['m13',1],['m33',2]],'dine','T7',98,'বিকাশ','সোহেল রানা','ইমন'],['EE-1039',[['m02',2],['m37',2]],'delivery',null,85,'নগদ টাকা','সোহেল রানা',''],['EE-1040',[['m01',1],['m22',1],['m34',2]],'dine','T9',71,'নগদ টাকা','সোহেল রানা','সাব্বির']];
  hist.forEach(h=>orders.push({id:h[0],type:h[2],table:h[3],src:h[2]==='online'?'app':'pos',items:h[1].map(x=>it(x[0],x[1])),k:'served',t:m(h[4]),paid:true,pt:m(h[4]-25),pay:[{m:h[5],a:0}],cashier:h[6],waiter:h[7],seedDone:1,cust:h[2]==='online'?{name:'নমুনা গ্রাহক ৫',phone:'01700-000205',addr:'হালিশহর'}:null,gw:h[5]==='বিকাশ'?'bkash':h[5]==='নগদ'?'nagad':null}));
  const S = {
    v:3, lang:'bn', role:'owner', seq:1046, menu, orders,
    cfg:{vat:5,svc:5,counter:'কাউন্টার ১'},
    ing:ING_SEED.map(a=>({id:a[0],name:a[1],unit:a[2],stock:a[3],min:a[4],cost:a[5],open:a[3]})),
    moves:[{t:m(600),ing:'chicken',q:20,type:'in',ref:'PO-0118 মাল গ্রহণ'},{t:m(590),ing:'veg',q:-1.5,type:'waste',ref:'পচে গেছে'},{t:m(300),ing:'prawn',q:5,type:'in',ref:'PO-0119 মাল গ্রহণ'}],
    tables:[['T1',2],['T2',4],['T3',4],['T4',4],['T5',6],['T6',2],['T7',6],['T8',8],['T9',4],['T10',4],['T11',2],['T12',10]].map(a=>({id:a[0],seats:a[1],res:a[0]==='T11'})),
    staff:STAFF_SEED.map(a=>({id:a[0],name:a[1],post:a[2],role:a[3],salary:a[4],shift:a[5],phone:'01700-0003'+a[0].slice(1).padStart(2,'0'),join:'২০২৬',adv:a[0]==='s7'?3000:a[0]==='s4'?5000:0,att:a[0]==='s9'?'late':a[0]==='s10'?'absent':'present'})),
    sup:SUP_SEED.map(a=>({id:a[0],name:a[1],cat:a[2],phone:a[3],due:a[4]})),
    po:[{id:'PO-0120',sup:'p1',t:m(120),status:'sent',lines:[{ing:'beef',q:15,cost:780},{ing:'chicken',q:25,cost:260}]},
        {id:'PO-0119',sup:'p3',t:m(1500),status:'received',lines:[{ing:'prawn',q:5,cost:950}]},{id:'PO-0118',sup:'p1',t:m(3000),status:'received',lines:[{ing:'chicken',q:20,cost:255}]}],
    supTx:[{t:m(3000),sup:'p1',d:'PO-0118 মাল গ্রহণ',dr:5100,cr:0},{t:m(2800),sup:'p1',d:'আংশিক পরিশোধ (ব্যাংক)',dr:0,cr:20000},{t:m(1500),sup:'p3',d:'PO-0119 মাল গ্রহণ',dr:4750,cr:0}],
    cust:CUST_SEED.map(a=>({id:a[0],name:a[1],phone:a[2],orders:a[3],spent:a[4],consent:!!a[5],area:a[6],pts:Math.round(a[4]/100)})),
    coupons:[{code:'EMBER10',type:'pct',val:10,min:500,on:true,used:37},{code:'WELCOME50',type:'amt',val:50,min:300,on:true,used:112},{code:'RAMADAN15',type:'pct',val:15,min:1000,on:false,used:64}],
    feedback:[{t:m(200),name:'নমুনা গ্রাহক ১',rate:5,text:'সি-ফুড কম্বো খুব ভালো ছিল। (নমুনা মতামত)',oid:'EE-1012'},{t:m(900),name:'নমুনা গ্রাহক ৩',rate:3,text:'খাবার ভালো, পরিবেশনে একটু দেরি হয়েছে। (নমুনা মতামত)',oid:'EE-0987'},{t:m(2000),name:'নমুনা গ্রাহক ৫',rate:4,text:'পরিবেশ সুন্দর। (নমুনা মতামত)',oid:'EE-0951'}],
    campaigns:[{t:m(4000),name:'শুক্রবারের অফার',n:4,status:'নমুনা — পাঠানো হয়নি'}],
    reservations:[{id:'R-208',name:'নমুনা অতিথি',phone:'01700-000301',date:'2026-11-18',time:'20:00',guests:6,note:'জানালার পাশে',status:'pending',t:m(90)},{id:'R-207',name:'নমুনা অতিথি ২',phone:'01700-000302',date:'2026-11-17',time:'21:30',guests:2,note:'',status:'confirmed',table:'T11',t:m(400)}],
    shift:{open:true,by:'তানিয়া আক্তার',t:m(380),opening:5000,io:[{t:m(200),type:'out',amt:600,why:'গ্যাস সিলিন্ডার'}],closed:null},
    shifts:[{by:'সোহেল রানা',date:'গতকাল সন্ধ্যা',opening:5000,sales:48200,expected:52650,counted:52600,diff:-50}],
    txns:[{id:'TXN-88017',t:m(268),gw:'bkash',oid:'EE-1032',amt:0,status:'success'},{id:'TXN-88018',t:m(241),gw:'nagad',oid:'EE-1033',amt:0,status:'success'},{id:'TXN-88019',t:m(176),gw:'bkash',oid:'EE-1035',amt:0,status:'success'},
          {id:'TXN-88020',t:m(150),gw:'nagad',oid:'EE-OLD1',amt:1260,status:'failed'},{id:'TXN-88021',t:m(98),gw:'bkash',oid:'EE-1038',amt:0,status:'success'},{id:'TXN-88021',t:m(97),gw:'bkash',oid:'EE-1038',amt:0,status:'dup'},
          {id:'TXN-88022',t:m(20),gw:'nagad',oid:'EE-OLD2',amt:890,status:'pending'},{id:'TXN-88023',t:m(3),gw:'bkash',oid:'EE-1043',amt:0,status:'success'}],
    vouchers:[{id:'V-0311',t:m(500),type:'খরচ',acc:'ইউটিলিটি',d:'বিদ্যুৎ বিল (নমুনা)',amt:8400,by:'রফিকুল আলম'},{id:'V-0312',t:m(200),type:'খরচ',acc:'রক্ষণাবেক্ষণ',d:'গ্যাস সিলিন্ডার',amt:600,by:'তানিয়া আক্তার'}],
    audit:[{t:m(380),u:'তানিয়া আক্তার',a:'ক্যাশিয়ার শিফট খোলা হয়েছে (প্রারম্ভিক নগদ ৳৫,০০০)'},{t:m(240),u:'রফিকুল আলম',a:'“বিফ ভুনা”-র মূল্য ৳৫২০ → ৳৫৪০'},{t:m(120),u:'রফিকুল আলম',a:'ক্রয়াদেশ PO-0120 পাঠানো হয়েছে'},{t:m(60),u:'মালিক',a:'কুপন RAMADAN15 বন্ধ করা হয়েছে'}],
    users:[{name:'মালিক (নমুনা)',user:'owner',role:'owner',on:true},{name:'রফিকুল আলম',user:'manager',role:'manager',on:true},{name:'তানিয়া আক্তার',user:'cash1',role:'cashier',on:true},{name:'সোহেল রানা',user:'cash2',role:'cashier',on:true},{name:'রাকিব',user:'waiter1',role:'waiter',on:true},{name:'ইমন',user:'waiter2',role:'waiter',on:true},{name:'সাব্বির',user:'waiter3',role:'waiter',on:true},{name:'শেফ আনোয়ার',user:'kitchen',role:'kitchen',on:true}],
    cart:[], me:{name:'',phone:'',addr:''}, myOrders:[], notes:[], review:{}, attDate:'আজ'
  };
  return S;
}
