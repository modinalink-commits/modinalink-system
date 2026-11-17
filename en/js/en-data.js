/* English copy: translates the shared sample data in place (loaded right after data.js). */
VERSION = 'Design Preview v0.1 (English copy) · 17 November 2026';
Object.assign(ORG, {addrBn:ORG.addrEn, hoursBn:ORG.hoursEn});
CATS.forEach(c => c.bn = c.en);
Object.values(AD).forEach(a => a.bn = a.en);
AREAS.forEach(a => a.bn = a.en);
MENU_SEED.forEach(a => { a[3]=a[2]; a[7]=a[6]; if(a[8].v) a[8].v.forEach(v => v.bn = v.en); });
(() => {
  const ing = {chicken:'Chicken',beef:'Beef',mutton:'Mutton',prawn:'Prawn',fish:'Fish (snapper/dory)',rice:'Basmati rice',potato:'Potato',flour:'Flour',cheese:'Mozzarella cheese',oil:'Soybean oil',veg:'Mixed vegetables',spice:'Spice mix',milk:'Milk',cream:'Cooking cream',fruit:'Fresh fruit',sugar:'Sugar',coffee:'Coffee beans',water:'Water 500ml'};
  const unit = {'কেজি':'kg','লিটার':'L','পিস':'pc'};
  ING_SEED.forEach(a => { a[1]=ing[a[0]]; a[2]=unit[a[2]]; });
  const st = [['Rafiqul Alam','Manager'],['Chef Anwar','Head chef'],['Mizanur','Chef'],['Jashim','Cook'],['Tania Akter','Cashier (Counter 1)'],['Sohel Rana','Cashier (Counter 2)'],['Rakib','Waiter'],['Emon','Waiter'],['Sabbir','Waiter'],['Nurul','Kitchen helper']];
  STAFF_SEED.forEach((a,i) => { a[1]=st[i][0]; a[2]=st[i][1]; a[5] = a[5]==='সকাল' ? 'day' : 'night'; });
  const sp = [['Karnaphuli Meat Supply','Meat'],['Halishahar Fresh Veg','Vegetables & fruit'],['Bandar Sea-Food','Fish & prawn'],['Agrabad Grocery','Grocery & dairy']];
  SUP_SEED.forEach((a,i) => { a[1]=sp[i][0]; a[2]=sp[i][1]; });
  const ar = {'হালিশহর':'Halishahar','আগ্রাবাদ':'Agrabad','বন্দর':'Bandar'};
  CUST_SEED.forEach((a,i) => { a[1]='Sample customer '+(i+1); a[6]=ar[a[6]]; });
})();
Object.assign(ROLES, {owner:'Owner',manager:'Manager',cashier:'Cashier',waiter:'Waiter',kitchen:'Kitchen'});
PERMS.splice(0, PERMS.length,
 ['View dashboard & reports',1,1,0,0,0],['Bill & take payment on POS',1,1,1,0,0],['Give discount (within limit)',1,1,1,0,0],['Void / amend an issued bill',1,1,0,0,0],['Take table orders',1,1,1,1,0],
 ['Change kitchen status',1,1,0,0,1],['Menu, prices & recipes',1,1,0,0,0],['Stock, purchasing & suppliers',1,1,0,0,0],['Staff, attendance & payroll',1,1,0,0,0],['Accounts & financial reports',1,0,0,0,0],
 ['Payment gateway settings',1,0,0,0,0],['Marketing & customer data',1,1,0,0,0],['Users & roles',1,0,0,0,0]);
MODULES.splice(0, MODULES.length,
 ['M01','Requirement analysis & software planning',12000,15,'Scope, users and workflow documents',[['plan','Planning document']]],
 ['M02','Core platform & security',25000,15,'Users, roles, settings, history, backups',[['admin-users','Users & security']]],
 ['M03','Customer website',15000,15,'Home, menu, offers, gallery, reservation, about, contact',[['site-home','Website'],['admin-reserve','Reservation list']]],
 ['M04','Online ordering & customer app',25000,30,'Menu, cart, checkout, order status, history',[['app-menu','Customer app']]],
 ['M05','POS & billing',40000,30,'Orders, tables, discount, bill split, shift, receipt',[['pos','POS']]],
 ['M06','Waiter app',12000,30,'Tables, orders, send to kitchen, bill request',[['waiter','Waiter panel']]],
 ['M07','Kitchen display & kitchen ticket',13000,30,'New, in progress, ready; timers; KOT',[['kds','Kitchen display']]],
 ['M08','Menu, recipes & food cost',10000,15,'Categories, items, variants, combos, recipes, cost',[['admin-menu','Menu & recipes']]],
 ['M09','Inventory & stock',18000,45,'Ingredients, stock in/out, waste, alerts, counting',[['admin-stock','Inventory']]],
 ['M10','Purchasing & suppliers',10000,45,'Suppliers, purchase orders, goods receipt, payables',[['admin-purchase','Purchasing']]],
 ['M11','Staff & HR',12000,45,'Profiles, attendance, shifts, payroll, advances',[['admin-hr','Staff']]],
 ['M12','Accounts & finance',25000,45,'Accounts, vouchers, transactions, P&L, balance sheet, VAT',[['admin-accounts','Accounts']]],
 ['M13','Payment gateway integration',10000,45,'bKash & Nagad, transactions, reconciliation',[['admin-payments','Payments']]],
 ['M14','Marketing & customer relations',10000,45,'Customers, SMS drafts, coupons, loyalty, feedback',[['admin-crm','Marketing']]],
 ['M15','Owner dashboard & reports',10000,45,'Sales summary, charts, popular items, export',[['admin-dashboard','Dashboard']]],
 ['M16','Deployment, testing & training',13000,45,'Review, data import, user guide, training, handover',[['handover','Handover document']]]);
IMG_CREDIT = "All photos are from Ember Essence's own Facebook posts and menu cards, taken from the files supplied by the client.";

(() => {
  const dict = [
   ['তানিয়া আক্তার','Tania Akter'],['সোহেল রানা','Sohel Rana'],['রফিকুল আলম','Rafiqul Alam'],['শেফ আনোয়ার','Chef Anwar'],['রাকিব','Rakib'],['ইমন','Emon'],['সাব্বির','Sabbir'],
   ['মালিক (নমুনা)','Owner (sample)'],['মালিক','Owner'],['নমুনা গ্রাহক','Sample customer'],['নমুনা অতিথি','Sample guest'],
   ['আগ্রাবাদ (নমুনা ঠিকানা)','Agrabad (sample address)'],['হালিশহর','Halishahar'],
   ['নগদ টাকা','Cash'],['বিকাশ','bKash'],['নগদ','Nagad'],
   ['মিডিয়াম ওয়েল','Medium well'],['কম ঝাল','Less spicy'],['চিনি কম','Less sugar'],['জানালার পাশে','By the window'],
   ['মাল গ্রহণ','goods received'],['পচে গেছে','Spoiled'],['আংশিক পরিশোধ (ব্যাংক)','Part payment (bank)'],['গ্যাস সিলিন্ডার','Gas cylinder'],['গতকাল সন্ধ্যা','Yesterday evening'],
   ['সি-ফুড কম্বো খুব ভালো ছিল। (নমুনা মতামত)','The Sea-Food Combo was excellent. (Sample feedback)'],['খাবার ভালো, পরিবেশনে একটু দেরি হয়েছে। (নমুনা মতামত)','Good food, service was a little slow. (Sample feedback)'],['পরিবেশ সুন্দর। (নমুনা মতামত)','Lovely atmosphere. (Sample feedback)'],
   ['শুক্রবারের অফার','Friday offer'],['নমুনা — পাঠানো হয়নি','Sample — not sent'],
   ['বিদ্যুৎ বিল (নমুনা)','Electricity bill (sample)'],['ইউটিলিটি','Utilities'],['রক্ষণাবেক্ষণ','Maintenance'],['খরচ','Expense'],
   ['ক্যাশিয়ার শিফট খোলা হয়েছে (প্রারম্ভিক নগদ ৳৫,০০০)','Cashier shift opened (opening cash ৳5,000)'],['“বিফ ভুনা”-র মূল্য ৳৫২০ → ৳৫৪০','Price of “Beef Bhuna” changed ৳520 → ৳540'],['ক্রয়াদেশ PO-0120 পাঠানো হয়েছে','Purchase order PO-0120 sent'],['কুপন RAMADAN15 বন্ধ করা হয়েছে','Coupon RAMADAN15 turned off'],
   ['কাউন্টার ১','Counter 1'],['আজ','Today']
  ].sort((a,b) => b[0].length - a[0].length);
  const fix = s => { dict.forEach(d => { if(s.includes(d[0])) s = s.split(d[0]).join(d[1]); }); return s.replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d)); };
  const walk = o => { for(const k in o){ const v=o[k]; if(typeof v==='string') o[k]=fix(v); else if(v && typeof v==='object') walk(v); } return o; };
  const bnSeed = seed;
  seed = function(){ const S = walk(bnSeed()); S.lang='en'; S.staff.forEach(s => s.join='2026'); return S; };
})();
