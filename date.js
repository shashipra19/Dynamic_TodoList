//jshint esversion:6
module.exports.getDate=function(){
  const today = new Date();
  const option = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  return today.toLocaleDateString("en-US", option);
  }

module.exports.getDay=function(){
  const today = new Date();
  const option = {
  weekday: "long",
  };
  return today.toLocaleDateString("en-US", option);
  }