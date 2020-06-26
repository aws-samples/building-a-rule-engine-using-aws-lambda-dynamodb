'use strict';
// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
// Set the region 
AWS.config.update({region: 'REGION'});
// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
//upload your rule functions into layers and reference those functions
const myfunc = require("myfunctionslayer");


exports.handler = (event, context, callback) => {

    event.Records.forEach((record) => {
        console.log('Stream record: ', JSON.stringify(record, null, 2));
        
        if (record.eventName == 'INSERT') {
            //get the rulenum to execute the rule
            var rulenum = JSON.stringify(record.dynamodb.NewImage.RuleNum.S);
            
            console.log("Results from Lambda Function: ", rulenum);
            
            //execute that rule by getting the rule details from the rules table.
            
            
              var params = {
                TableName: "RuleTable",
                ProjectionExpression: "Code",
                KeyConditionExpression: "#RuleNum = :rulenum",
                ExpressionAttributeNames:{
                    "#RuleNum": "rulenum"
                    },
                ExpressionAttributeValues: {
                    ":RuleNum":rulenum
                    }
                };

            // Call DynamoDB to read the item from the table 
            //which will retrieve the function name for the rule num
            var funcname = ddb.getItem(params, function(err, data) {
              if (err) {
                console.log("Error", err);
              } else {
                console.log("Success", data.Item);
                
              }
            });
             //call the rule function
            if(funcname == "func1")
              myfunc.func1();
            if(funcname == "func2")
              myfunc.func2();
            
            
        }
        
        
        
    });
    callback(null, `Successfully processed ${event.Records.length} records.`);
};   