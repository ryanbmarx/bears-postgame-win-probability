function getTeamColors(team){
  var colorLookup = {
    '49ers': { opponent_color: "#940029", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Chicago: { opponent_color: "#12182d", opponent_text_color: "white", bears_color: "#DD4814", bears_text_color: "black"},
    Bengals: { opponent_color: "#FB4F14", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Bills: { opponent_color: "#C60C30", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Broncos: { opponent_color: "#FB4F14", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Browns: { opponent_color: "#ed7e11", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "black"},
    Buccaneers: { opponent_color: "#D60A0B", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Cardinals: { opponent_color: "#B10339", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Chargers: { opponent_color: "#05173C", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
    Chiefs: { opponent_color: "#C60024", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Colts: { opponent_color: "#00417E", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
    Cowboys: { opponent_color: "#D0D2D4", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "black"},
    Dolphins: { opponent_color: "#008D97", opponent_text_color: "white", bears_color: "#031E2F", bears_text_color: "white"},
    Eagles: { opponent_color: "#004953", opponent_text_color: "white", bears_color: "#031E2F", bears_text_color: "white"},
    Falcons: { opponent_color: "#231F20", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
    Giants: { opponent_color: "#003155", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    Jaguars: { opponent_color: "#00839C", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Jets: { opponent_color: "#2A433A", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
    Lions: { opponent_color: "#006EA1", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    'Green Bay': { opponent_color: "#FFCC00", opponent_text_color: "white", bears_color: "#031E2F", bears_text_color: "black"},
    Panthers: { opponent_color: "#0088CE", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Patriots: { opponent_color: "#00295B", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
    Raiders: { opponent_color: "#000000", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    Rams: { opponent_color: "#00295B", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    Ravens: { opponent_color: "#2B025B", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
    Redskins: { opponent_color: "#8C001A", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Saints: { opponent_color: "#C6A876", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Seahawks: { opponent_color: "#030F1F", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    Steelers: { opponent_color: "#000000", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    Texans: { opponent_color: "#00133F", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    Titans: { opponent_color: "#002C4B", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    Vikings: { opponent_color: "#240A67", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"}
  };

  return {
    color:colorLookup[team]['opponent_color'],
    textColor:colorLookup[team]['opponent_text_color']
  };
}
module.exports = getTeamColors;