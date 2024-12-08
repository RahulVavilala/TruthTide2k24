const CodeGen = require('../models/CodeGen.js');
const User = require('../models/User.js');

exports.postAgentResponses = async(req, res, next) => {
    try {
        console.log("IN { controller / postAgentResponses } with following param")
        console.log(req.body)
        const user = await User.findById(req.user.id).exec();
        const agentResponse = structuredClone(req.body.agentResponses)

        const agentResponseFiltered = agentResponse.map(data => ({
            ...data,
            engineer: {
              code: data.engineer["Generated Code Snippet"],
              location: data.engineer.Location
            },
            projectManager: {
              plan: data.projectManager["Implementation Plan"],
              files: data.projectManager["Relevant Files"]
            }
          }));
        
        console.log("AgentLogging sent to the DB")
        console.log(agentResponseFiltered)

        const codeGenDetail = {
            user: user._id,
            id: req.body.id,
            agentResponses: agentResponseFiltered
        };
        console.log(codeGenDetail)

        console.log("ID :" + req.body.id)
        const existing_id = await CodeGen.findOne({ id: req.body.id }).exec();
        console.log("Existing Id")
        console.log(existing_id)

        
        if (existing_id) {
          existing_id.agentResponses = agentResponseFiltered;
          await existing_id.save();
        }
        else {
          const code_gen = new CodeGen(codeGenDetail);
          await code_gen.save();
        }

        res.send({ result: "success" });
    } catch (err) {
        next(err);
    }
}