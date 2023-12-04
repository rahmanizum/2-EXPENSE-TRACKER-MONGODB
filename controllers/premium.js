
const User = require('../models/users');
const Expenses = require('../models/expenses');
const Awsservice = require('../services/awsservices'); 
exports.getLeaderboardExpenses = async (request, response, next) => {
  try {
    // const leaderboard = await User.findAll({
    //   attributes: ['id', 'name', 'totalExpenses'],
    //   order: [['totalExpenses', 'DESC']],
    //   limit:15
    // });
    leaderboard=[];
    return response.status(200).json(leaderboard);
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Unauthorized - please relogin' });
  }
};


exports.getDownloadURL = async (request, response, next) => {
  try {
    const {userId} = request;
    const user = await User.fetchById(userId);
    const expenses = await Expenses.fetchAll(0,0,userId)
    const formattedExpenses = expenses.map(expense => {
      return `Category: ${expense.category}
Payment Method: ${expense.pmethod}
Amount: ${expense.amount}
Date: ${expense.date}
`;
    });
    const textData = formattedExpenses.join("\n");
    const filename = `expense-data/user${userId}/${user.name}${new Date()}.txt`;
    const URL = await Awsservice.uploadToS3(textData, filename);
    await User.saveDownloadHistory(userId,{
      downloadUrl:URL,
      createdAt:new Date()
    })
    response.status(200).json({URL,success:true});
  } catch (error) {
    console.log("Error while creating download link: " + error);
    response.status(500).json({ message: "Unable to generate URL" });
  }
};
exports.getDownloadhistory = async(request,response,next) =>{
  try {
  const {userId} = request;
    const {downloadUrl}= await User.fetchById(userId);
    response.status(200).json({history:downloadUrl});
    
  } catch (error) {
    console.log(error);
    return response.status(401).json({ message: 'Unable to fetch history' });
  }
}

