tabris.ui.set("background", "red");

tabris.ui.on("change:activePage", function(){
  postMBR();
});

var page = new tabris.Page({
  title: "Modellberechnung",
  topLevel: true
});




var labelRate = new tabris.TextView({
  layoutData: {left: 5, centerY: 0, width: 65},
  id: "labelRate",
  font: "18px sans-serif",
  text: "Rate"
});

var sliderRate = new tabris.Slider({
  layoutData: {left: "#labelRate 2", right: "#displayRate 2", centerY: 0},
  id: "sliderRate",
  textColor: "red",
  minimum: 100,
  selection: 300,
  maximum: 1000
});

var displayRate = new tabris.TextView({
  layoutData: {right: 5, centerY: 0, width: 100},
  alignment: "right",
  id: "displayRate",
  font: "18px sans-serif",
  text: "300 €"
});

var panelRate = new tabris.Composite({
  layoutData: {left: 10, top: 18, right: 10},
  id: "panelRate"
 
});

panelRate.append(labelRate);
panelRate.append(sliderRate);
panelRate.append(displayRate);
panelRate.appendTo(page);

var labelLaufzeit = new tabris.TextView({
  layoutData: {left: 5, centerY: 0, width: 65},
  id: "labelLaufzeit",
  font: "18px sans-serif",
  text: "Laufzeit"
});

var sliderLaufzeit = new tabris.Slider({
  layoutData: {left: "#labelLaufzeit 2", right: "#displayLaufzeit 2", centerY: 0},
  id: "sliderLaufzeit",
  textColor: "red",
  minimum: 0,
  selection: 36,
  maximum: 120
});

var displayLaufzeit = new tabris.TextView({
  layoutData: {right: 5, centerY: 0, width: 100},
  alignment: "right",
  id: "displayLaufzeit",
  font: "18px sans-serif",
  text: "36 Monate"
});

var panelLaufzeit = new tabris.Composite({
  layoutData: {left: 10, top: "#panelRate 10", right: 10},
  id: "panelLaufzeit"
 
});

panelLaufzeit.append(labelLaufzeit);
panelLaufzeit.append(sliderLaufzeit);
panelLaufzeit.append(displayLaufzeit);
panelLaufzeit.appendTo(page);

var buttonBerechnen = new tabris.Button({
  layoutData: {left: 10, right: 10, top: "prev() 10"},
  alignment: "center",
  font: "18px sans-serif",
  id: "buttonBerechnen",
  text: "Berechnen"
});
buttonBerechnen.appendTo(page);

var panelErgebnis = new tabris.Composite({
  layoutData: {left: 10, top: "#buttonBerechnen 10", right: 10},
  id: "panelErgebnis"
});

var panelErgebnisZins = new tabris.Composite({
  layoutData: {left: 10, top: 5, right: 10},
  id: "panelErgebnisZins"
});

var labelZins = new tabris.TextView({
  layoutData: {left: 0, centerY: 0, width: 200},
  id: "labelZins",
  font: "18px sans-serif",
  text: "Zinssatz:"
});

var displayZins = new tabris.TextView({
 	layoutData: {left: "#labelZins 5", centerY: 0, right: 0},
  	font: "18px sans-serif",
  	id: "displayZins"
});


var panelErgebnisGuthaben = new tabris.Composite({
  layoutData: {left: 10, top: "#panelErgebnisZins 10", right: 10},
  id: "panelErgebnisGuthaben"
});

var labelGuthaben = new tabris.TextView({
  layoutData: {left: 0, centerY: 0, width: 200},
  id: "labelGuthaben",
  font: "18px sans-serif",
  text: "Gesamtguthaben:"
});

var displayGuthaben = new tabris.TextView({
 	layoutData: {left: "#labelGuthaben 5", centerY: 0, right: 0},
  font: "18px sans-serif",
  	id: "displayGuthaben"
});


panelErgebnis.appendTo(page);


function createErrorText (text){
  new tabris.TextView({
    text: text,
    textColor: "red",
    font: "22px sans-serif",
    layoutData: {left: 10, right: 10, top: "prev() 10"},
    class: "errorText"
  }).appendTo(page);
};


 function timeout(ms, promise) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error("timeout"));
    }, ms)
    promise.then(resolve, reject);
  })
};


function postMBR(){
  page.children(".errorText").dispose();
  buttonBerechnen.set("enabled", false);
  
  var laufzeit = sliderLaufzeit.get("selection");
  var rate = sliderRate.get("selection");
  
  var data = {
	"apiVersion":"1.0",
	"blz":94059421,
	"context":"137353393383500000000000",
	"params":{
		"laufzeit":"" + laufzeit + "",
		"rate": "" + rate + ""
	},
	"service":"38871ca4-32c4-431d-bdad-e3f0b3770850",
	"session":"Dialog-ID",
	"timestamp":"2014-08-11T12:56:43.8040200"
};
  
	var headers = new Headers();
  headers.append("Content-Type", "application/json;charset=utf-8");
  headers.append("X-Secret", "blabla");
  headers.append("X-CLCERT", "blabla-yomo-blub");
  
  var init = {method: 'POST',
             headers: headers,
             body: JSON.stringify(data)}
  var url = 'https://pt-v00-ed.s-hbci.de/uca/rest/isp'
  var request = new Request(url, init);
  	console.info("Request send");
    console.debug(JSON.stringify(request.headers.map));
    console.debug(request);
    timeout(30000,  fetch(request)).then(function(response){
      
    if(response.ok){
      console.info("Response: Status:" + response.status + "; StatusText:" + 		response.statusText);
      console.debug(response);
    return response.json(); 
    }else{
      console.error("Response: Status:" + response.status + "; StatusText:" + 		response.statusText);
      console.log(response);
    }
    
  }).catch(function (err){
    buttonBerechnen.set("enabled", true);
      console.error(err);
    createErrorText(err || "Fehler beim empfangen der Ergebnisse!");
  }).then(function (json){
    if(json["data"]["error"] == true){
      console.error("errorMessage:" + json["data"]["errorMessage"]);
    }else{
     var result = json["data"]["items"][0]["result"];
     var zinssatz =  result["Zinssatz gesamt"].trim();
     var guthaben =  result["Gesamtguthaben"].trim();
      console.log(zinssatz);
      console.log(guthaben);
    displayZins.set("text", zinssatz + " %");
    labelZins.appendTo(panelErgebnisZins);
    displayZins.appendTo(panelErgebnisZins);
    panelErgebnisZins.appendTo(panelErgebnis);
    
    displayGuthaben.set("text", guthaben + " €");
    labelGuthaben.appendTo(panelErgebnisGuthaben);
    displayGuthaben.appendTo(panelErgebnisGuthaben);
    panelErgebnisGuthaben.appendTo(panelErgebnis);
    }
    
    buttonBerechnen.set("enabled", true);

  })
};

buttonBerechnen.on("select", function(button){
  postMBR();
});
sliderRate.on("change:selection", function(slider, selection) {
  displayRate.set("text", selection + " €");
});

sliderLaufzeit.on("change:selection", function(slider, selection) {
  displayLaufzeit.set("text", selection + " Monate");
});

page.open();
      
      
      
      
      
      