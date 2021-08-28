/**
  Example worker function

on('change:', function() {
  setAttrs({});
});
*/

const buttonlist = ["basic","attributes","weapons","combat","gear","vehicle","notes"];
buttonlist.forEach(button => {
    on(`clicked:${button}`, function(eventInfo) {
      console.log(JSON.stringify(eventInfo));
        setAttrs({
            sheetTab: button
        });
    });
});