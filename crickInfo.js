const url="https://www.espncricinfo.com/series/ipl-2021-1249214";
const request=require("request");
const cheerio=require("cheerio");
const fs=require("fs");
const path=require("path");

request(url,callback);

function callback(error,response,data){ 
    if(error){
        console.log(error);
    }
    else if(response.statusCode==404){
        console.log("Page Not Found");
    }
    else{
        viewAllResults(data);
    }
}

function viewAllResults(data){
    let search=cheerio.load(data);
    let anchor=search(".list-unstyled.mb-0 .widget-items.cta-link a");
    let link=anchor.attr("href");
    let linkSplit=link.split("/");
    linkSplit.pop();
    let str=linkSplit.join("/");
    str=str+"/match-results";
    let fullLink=`https://www.espncricinfo.com${str}`;
    console.log(fullLink);
    request(fullLink,newcallback);
}

function newcallback(error,response,data){
    if(error){
        console.log(error);
    }
    else if(response.statusCode==404){
        console.log("Page Not Found");
    }
    else{
        scoreBoard(data);
    }
}
function scoreBoard(data){
    let search=cheerio.load(data);
    let scoreBoardArray=search(".match-cta-container");
    for(let i=0;i<scoreBoardArray.length;i++){
    let anchor=search(scoreBoardArray[i]).find("a");
    let link=search(anchor[2]).attr("href");
    let fullLink=`https://www.espncricinfo.com${link}`;
    console.log(fullLink);
    request(fullLink,callBack);
}
}

function callBack(error,response,data){
    if(error)
    console.log(error);
    else if(response.statusCode==404)
    console.log("Page Not Found");
    else{
        tableExtract(data);
    }
}

function tableExtract(data){
    let search=cheerio.load(data);
    let teamList=search(".match-info-MATCH .name");
    
    // let opponentTeam=search(teamList[1]).text();
    // console.log(teamName+" "+opponentTeam);
    let bothTeams=search(".table.batsman");
    // let firstTeamPlayers=search(bothTeams[0]).find("a");
    // let secondTeamPlayers=search(bothTeams[1]).find("a");
    let runs=search(".table.batsman tbody tr");
    
    let venue=search(".match-info .description").text();
    let venuePart=venue.split(",");
    let city=venuePart[1].trim();
    console.log(city);
    let date=venuePart[2].trim();
    console.log(date);
    let bestPlayer=search(".best-player-content .best-player-name>a").text();
    console.log(bestPlayer);


    for(let i=0;i<bothTeams.length;i++){
        teamPlayers=search(bothTeams[i]).find("a");
        let teamName=search(teamList[i]).text();
        for(let j=0;j<teamPlayers.length;j++){
            let td=search(runs[j]).find("td").text();
            createInfoFile(teamName,search(teamPlayers[j]).text(),city,date,td);
        }
    }
    
    
    
   
    




}

function createInfoFile(teamName,playerName,city,date,td){

  const pathTeam=path.join(__dirname,teamName);
  if(!fs.existsSync(pathTeam)){
      fs.mkdirSync(pathTeam);
  }
   let str=playerName+" "+city+" "+date+" "+td+"\n";
   str=JSON.stringify(str);
   let jsonData=JSON.parse(str);
      playerName=playerName+".txt";
      let pathPlayer=path.join(pathTeam,playerName);
//    fs.appendFile(pathPlayer,str);
      fs.appendFile(pathPlayer,jsonData,()=>{
        //   console.log("Done");
      })
}