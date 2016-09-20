function getTeamColors(team){
  var colorLookup = {
    'San Francisco': { opponent_color: "#940029", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Chicago: { opponent_color: "#12182d", opponent_text_color: "white", bears_color: "#DD4814", bears_text_color: "black"},
    Cincinnati: { opponent_color: "#FB4F14", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Buffalo: { opponent_color: "#C60C30", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Denver: { opponent_color: "#FB4F14", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Cleveland: { opponent_color: "#ed7e11", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "black"},
    'Tampa Bay': { opponent_color: "#D60A0B", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    'Arizona': { opponent_color: "#B10339", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    'San Diego': { opponent_color: "#05173C", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
    'Kansas City': { opponent_color: "#C60024", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Indianapolis: { opponent_color: "#00417E", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
    Dallas: { opponent_color: "#D0D2D4", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "black"},
    Miami: { opponent_color: "#008D97", opponent_text_color: "white", bears_color: "#031E2F", bears_text_color: "white"},
    Philadelphia: { opponent_color: "#C0C0C0", opponent_text_color: "white", bears_color: "#031E2F", bears_text_color: "white"},
    Atlanta: { opponent_color: "#231F20", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
    'New York Giants': { opponent_color: "#003155", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    Jacksonville: { opponent_color: "#00839C", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    'New York Jets': { opponent_color: "#2A433A", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
    Detroit: { opponent_color: "#006EA1", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    'Green Bay': { opponent_color: "#FFCC00", opponent_text_color: "white", bears_color: "#031E2F", bears_text_color: "black"},
    Carolina: { opponent_color: "#0088CE", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    'New England': { opponent_color: "#00295B", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
    Oakland: { opponent_color: "#000000", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    'St. Louis': { opponent_color: "#00295B", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    Baltimore: { opponent_color: "#2B025B", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
    'Washington': { opponent_color: "#8C001A", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    'New Orleans': { opponent_color: "#C6A876", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
    Seattle: { opponent_color: "#030F1F", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    Pittsburgh: { opponent_color: "#000000", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    Houston: { opponent_color: "#B31B34", opponent_text_color: "white", bears_color: "#DD4814", bears_text_color: "black"},
    Tennessee: { opponent_color: "#002C4B", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
    Minnesota: { opponent_color: "#240A67", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"}
  };

  return {
    color:colorLookup[team]['opponent_color'],
    textColor:colorLookup[team]['opponent_text_color']
  };
}
module.exports = getTeamColors;