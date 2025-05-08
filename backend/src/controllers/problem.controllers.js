import {db} from "../libs/db.js"

const createProblem = async (req, res) => {

    // going to get all the data from the request body -
    const {title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolution} = req.body

    if(req.user.role !== "ADMIN"){
        return res.status(403).json({
            error: "You are not allowed to create a problem"
        })
    }

    try {
        for(const [language, solutionCode] of Object.entries(referenceSolution)){
            const languageId = getJudge0LanguageId(language);

            if(!languageId){
                return res.status(400).json({
                    error: `Language ${language} is not supported!`
                })
            }

            const submissions = testcases.map(({input, output}) => ({
                source_code : solutionCode,
                language_id : languageId,
                stdin: input,
                expected_output : output,
            }))

            const submissionResults = await submitBatch(submissions)

            const tokens = submissionResults.map((res) => res.token)

            const results = await pollBatchResults(tokens)


            for(let i=0; i < results.length; i++){
                const result = results[i]

                if(result.status.id !== 3){
                    return res.status(400).json({
                        error: `Testcase ${i+1} failed for langauge ${langauge}`,
                    })
                }
            }


            const newProblem = await db.problem.create({
                data: {
                    title, 
                    description,
                    difficulty, 
                    tags, 
                    examples, 
                    constraints, 
                    testcases, 
                    codeSnippets, 
                    referenceSolution, 
                    userId: req.user.id
                }
            })
        }

        return res.status(201).json(newProblem);

    } catch (error) {
        
    }
}

const getAllProblems = async (req, res) => {}

const getProblemById = async (req, res) => {}

const updateProblem = async (req, res) => {}

const deleteProblem = async (req, res) => {}

const getAllProblemsSolvedByUser = async (req, res) => {}

export {createProblem, getAllProblems, getProblemById, updateProblem, deleteProblem, getAllProblemsSolvedByUser}