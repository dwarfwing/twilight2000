/**
  Example worker function

on('change:', function() {
  setAttrs({});
});
*/

// VersionController()
// on sheet:opened VersionController(version)
// Upgrade from version 0
//  Repeating weapons
//  Armor 
//  Gear
//  CUF till cuf
//  Manipulation to persuasion
//  


  /* ===== PARAMETERS ==========
  GiGs 'Super Simple Summarizer', modified so that you need to include "repeating_" in the name of the section, 
  which allows to use it for any indexed attribute series with the format [name]_[id]_[field] -- NOT WORKING
  */
 const repeatingSum = (destination, section, fields, multiplier = 1) => {
  if (!Array.isArray(fields)) fields = [fields];
  getSectionIDs(`${section}`, (idArray) => {
    const attrArray = idArray.reduce((m, id) => [...m, ...fields.map((field) => `${section}_${id}_${field}`)], []);
    getAttrs(attrArray, (v) => {
      console.log("values of v: " + JSON.stringify(v));
      // getValue: if not a number, returns 1 if it is 'on' (checkbox), otherwise returns 0..
      const getValue = (section, id, field) => parseFloat(v[`${section}_${id}_${field}`]) || (v[`${section}_${id}_${field}`] === "on" ? 1 : 0);

      const sumTotal = idArray.reduce((total, id) => total + fields.reduce((subtotal, field) => subtotal * getValue(section, id, field), 1), 0);
      setAttrs({
        [destination]: sumTotal * multiplier,
      });
    });
  });
};

/* combat gear encumbrance */
on("change:repeating_combatgear remove:repeating_combatgear sheet:opened", () => {
 console.log("Change Detected: Combat Gear Encumbrance");
 repeatingSum("combatgear_total", "repeating_combatgear", ["weight", "amount"]);
});

/* weapon encumbrance */
on("change:repeating_weapons remove:repeating_weapons sheet:opened", () => {
 console.log("Change Detected: Weapon Encumbrance");
 repeatingSum("weaponweight_total", "repeating_weapons", ["weight"]);
});

/* armor encumbrance */
const armorrating = [["armor_one","armor_one_rating","armor_one_damage"],["armor_two","armor_two_rating","armor_two_damage"],["armor_three","armor_three_rating","armor_three_damage"],["armor_four","armor_four_rating","armor_four_damage"]];
const armorweight = ["armor_one_weight","armor_two_weight","armor_three_weight","armor_four_weight"];
armorrating.forEach( (item) => {
  //console.log("Making sheet worker: "+JSON.stringify(item));  
  on(`change:${item[1]} change:${item[2]}`, () => { // Removed sheet:opened
    getAttrs(item, (values) => {
      //console.log("Change Detected: Armor Rating: "+JSON.stringify(item));
      //console.log("Change Detected: Armor Rating rating: "+parseInt(values[item[1]]));
      //console.log("Change Detected: Armor Rating damage: "+parseInt(values[item[2]]));
      const rating = parseInt(values[item[1]]),
      damage = parseInt(values[item[2]]),
      dmgadj = damage < -rating ? -rating : damage,
      ar = Math.max(rating + damage,0), 
      attr = item[0]+"_ar";
      console.log("Change Detected: Armor Rating: "+attr+" "+ar+" and damage "+dmgadj);
      setAttrs({[attr]: ar,
                [item[2]]: dmgadj},false);
      });
   });
});

armorweight.forEach(item => {
  on(`change:${item} remove:${item} sheet:opened`, () => {
    console.log("Change Detected: Armor Encumbrance: "+JSON.stringify(item));
    //console.log("Armor wigths: "+`${armorweight}`);
    getAttrs(armorweight, (values) => {
      //console.log("Armor weigths: "+ parseFloat(values.armor_one_weight) +" "+ parseFloat(values.armor_two_weight) +" "+ parseFloat(values.armor_three_weight) +" "+ parseFloat(values.armor_four_weight));
      //console.log("Armor weigths by index: "+ parseFloat(values[0]) +" "+ parseFloat(values[1]) +" "+ parseFloat(values[2]) +" "+ parseFloat(values[3]));
      const sum = _.reduce(values, (m,n) => {return parseFloat(m||0)+parseFloat(n||0)}, values[0]);
      //console.log("Armor weigth sum: "+ sum);
      //const sum = parseInt(values[0]) + parseInt(values[1]) + parseInt(values[2]) + parseInt(values[3]);
      setAttrs({armorweight_total: sum});
    });
   });
});

/* Total carry encumbrance */
on("change:armorweight_total change:combatgear_total change:weaponweight_total sheet:opened", function () {
  console.log("Change Detected: Total Gear Encumbrance");
  getAttrs(["armorweight_total","combatgear_total","weaponweight_total","carrycap_total"], (values) => {
    console.log("Change Detected: Total Gear Encumbrance : "+JSON.stringify(values));
    const armor = parseFloat(values.armorweight_total),
    combat = parseFloat(values.combatgear_total),
    weapon = parseFloat(values.weaponweight_total),
    total = parseFloat(armor+combat+weapon);
    console.log("Change Detected: Carrycap_total : "+total);
    setAttrs({carrycap_total: total});
  });
});

/* backpack encumbrance */
on("change:repeating_backpack remove:repeating_backpack sheet:opened", function () {
  console.log("Change Detected: Backpack Gear Encumbrance");
  repeatingSum("backpack_total", "repeating_backpack", ["weight", "amount"]);
});

/* vehicle encumbrance */
on("change:repeating_vehiclegear remove:repeating_vehiclegear sheet:opened", () => {
  console.log("Change Detected: vehicle Gear Encumbrance");
  repeatingSum("vehiclegear_total", "repeating_vehiclegear", ["weight", "amount"]);
});


const buttonlist = ["basic","attributes","weapons","combat","action","gear","vehicle","notes","stockpile"];
buttonlist.forEach(button => {
    on(`clicked:${button}`, function(eventInfo) {
      console.log(JSON.stringify(eventInfo));
        setAttrs({
            sheetTab: button
        });
    });
});


const valueList = ["strength","heavyweapons","closecombat","stamina","agility","driving","mobility","rangedcombat","intelligence","recon","survival","tech","empathy","command","persuasion","medicalaid","cuf","cuf_unit"];
valueList.forEach(value => {
    on(`change:${value} sheet:opened`, function() {  
        getAttrs([`${value}`], function(v) {
          console.log(JSON.stringify(v));
          const rank = v[`${value}`], attribute = `${value}die`;
          const dietype = `${value}dietype`;
          var die = 0, setter = {};
          if (rank == "A") die = 12;
          if (rank == "B") die = 10;
          if (rank == "C") die = 8;
          if (rank == "D") die = 6;
          if (rank == "F") die = '';
          setter[attribute] = die;
          setter[dietype] = die == '' ? "" : "D"+die;
          setAttrs(setter);
        });
    });
});

// Update Hit Capacity
on('change:strengthdie change:agilitydie sheet:opened', () => {
  getAttrs(["strengthdie","agilitydie","hitcapacity"], (values) => {
    console.log(JSON.stringify(values));
    const str = parseInt(values.strengthdie),
    agi = parseInt(values.agilitydie),
    hitcap = Math.ceil(( str + agi ) / 4);
    console.log("HIt capacity calculated: "+hitcap);
    setAttrs({hitcapacity : hitcap});
  });
});

// Update Stress capacity
on('change:intelligencedie change:empathydie sheet:opened', () => {
  getAttrs(["intelligencedie","empathydie","stresscapacity"], (values) => {
    console.log(JSON.stringify(values));
    const int = parseInt(values.intelligencedie),
    emp = parseInt(values.empathydie),
    stresscap = Math.ceil(( int + emp ) / 4);
    console.log("Stress capacity calculated: "+stresscap);
    setAttrs({stresscapacity : stresscap});
  });
});

// Update Carry Limit
on('change:strengthdie sheet:opened', () => {
  getAttrs(["strengthdie","carry_limit","carry_limit_backpack"], (values) => {
    console.log(JSON.stringify(values));
    const str = parseInt(values.strengthdie);
    console.log("Carry limit calculated: "+str);
    setAttrs({carry_limit: str,
              carry_limit_backpack: str});
  });
});