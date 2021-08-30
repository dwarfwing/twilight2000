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
  GiGs 'Super Simple Summarizer'
  */
 const repeatingSum = (destination, section, fields, multiplier = 1) => {
  if (!Array.isArray(fields)) fields = [fields];
  getSectionIDs(`repeating_${section}`, (idArray) => {
    const attrArray = idArray.reduce((m, id) => [...m, ...fields.map((field) => `repeating_${section}_${id}_${field}`)], []);
    getAttrs(attrArray, (v) => {
      console.log("values of v: " + JSON.stringify(v));
      // getValue: if not a number, returns 1 if it is 'on' (checkbox), otherwise returns 0..
      const getValue = (section, id, field) => parseFloat(v[`repeating_${section}_${id}_${field}`]) || (v[`repeating_${section}_${id}_${field}`] === "on" ? 1 : 0);

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
 repeatingSum("combatgear_total", "combatgear", ["weight", "amount"]);
});

/* weapon encumbrance */
on("change:repeating_weapons remove:repeating_weapons sheet:opened", () => {
 console.log("Change Detected: Weapon Encumbrance");
 repeatingSum("weaponweight_total", "weapons", ["weight"]);
});

/* backpack encumbrance */
on("change:repeating_backpack remove:repeating_backpack sheet:opened", function () {
  console.log("Change Detected: Backpack Gear Encumbrance");
  repeatingSum("backpack_total", "backpack", ["weight", "amount"]);
});

/* vehicle encumbrance */
on("change:repeating_vehiclegear remove:repeating_vehiclegear sheet:opened", () => {
  console.log("Change Detected: vehicle Gear Encumbrance");
  repeatingSum("vehiclegear_total", "vehiclegear", ["weight", "amount"]);
});


const buttonlist = ["basic","attributes","weapons","combat","gear","vehicle","notes"];
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