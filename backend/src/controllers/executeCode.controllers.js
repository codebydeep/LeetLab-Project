import { pollBatchResults, submitBatch } from "../libs/judge0.libs.js";

const executeCode = async (req, res) => {
   try {
    const {
        source_code,
        language_id,
        stdin,
        expected_outputs,
        problemId 
    } = req.body

    const userId = req.user.id;

    if(
        !Array.isArray(stdin) || 
        stdin.length === 0 || 
        !Array.isArray(expected_outputs) || 
        expected_outputs.length !== stdin.length
    ){
        return res.status(400).json({
            error: "Invalid or Missing Test Cases"
        })
    }

    const submissions = stdin.map((input) => ({
        source_code,
        language_id,
        stdin: input,
    }))

    const submitResponse = await submitBatch(submissions);

    const tokens = submitResponse.map((res) => res.token);

    const results = await pollBatchResults(tokens);

    console.log(`Result----------`);
    console.log(results);
    
    res.status(200).json({
        message: "Code Executed!"
    })
        
   } catch (error) {
        return res.status(400).json({
            error: "Invalid or Missing Test Cases"
        }) 
   }
}

export default executeCode