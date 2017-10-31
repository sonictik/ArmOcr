
var translateText = function(removeEndlines)
{
    /*var lang = "am";
    var langto = "en";
    google.language.translate(translateDiv.get("html"),lang,toLang,callback);*/

    //finText = translation[urlG];
    var text = lastSaved;
    var toLang = document.getElementById("toLanguage").value;
    requestTranslation(text, toLang, removeEndlines);
};