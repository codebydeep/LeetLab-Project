import {db} from "../libs/db.js"
import {getJudge0LanguageId, pollBatchResults, submitBatch} from "../libs/judge0.libs.js"

// createProblem controller -
const createProblem = async (req, res) => {

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
                console.log("Results-----", result);

                // console.log(
                    // `Testcase ${i+1} and language ${language} -----result ${JSON.stringify(result.status.description)} `
                // );
                
                if(result.status.id !== 3){
                    return res.status(400).json({
                        error: `Testcase ${i+1} failed for langauge ${language}`,
                    })
                };
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
                userId: req.user.id,
            }
        })
            

        return res.status(201).json({
            success: true,
            message: "Problem Created Successfully",
            problem: newProblem,
        });

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            error: "Error in Creating Problem"
        })
    }
}

// getAllProblems controller - 
const getAllProblems = async (req, res) => {
    try {
        const problems = await db.problem.findMany();

        if(!problems){
            return res.status(404).json({
                success: false,
                error: "No Problems found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Problems Fetched Successfully",
            problems,
        })

    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
                error: "Error while Fetching Problems"
        })
    };
};


// getProblemsById controller -
const getProblemById = async (req, res) => {
    const {id} = req.params;
    
    try {
        const problem = await db.problem.findUnique({
            where: {
                id,
            }
        })

        if(!problem){
            return res.status(404).json({
                error: "Problem not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Problem Fetched Successfully",
            problem,
        })

    } 
    catch (error) {
        console.log(error);
        
        return res.status(500).json({
                error: "Error while Fetching Problem by Id"
        })
    }
}


// update Problem controller -
const updateProblem = async (req, res) => {
    const {problemId} = req.params;

    const {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolution
    } = req.body

    const problem = await db.problem.findFirst({
        where: {
            id: problemId,
        }
    })

    if(!problem){
        return res.status(404).json({
            success: false,
            message: "No Problem Found"
        })
    }
    
    try {
        const updatedProblem = await db.problem.update({
            where: {
                id: problemId,
            },
            data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testcases,
                codeSnippets,
                referenceSolution
            }
        })

        return res.status(200).json({
            success: true,
            message: "Problem Update Successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in Updating Problem"
        })
    }
}


// delete Problem controller -
const deleteProblem = async (req, res) => {
    const {id} = req.params

    try {
        const problem = await db.problem.findUnique({
            where: {id}
        });
        
        if(!problem){
            return res.status(404).json({error: "Problem Not Found"});
        }

        await db.problem.delete({where: {id}});
        
        res.status(200).json(200).json({
            success: true,
            message: "Problem deleted Successfully"
        });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Error while deleting the Problem"
            })
        }
}


// getAllProblemsSolvedByUser - 
const getAllProblemsSolvedByUser = async (req, res) => {
    try {
        const problems = await db.problem.findMany({
            where: {
                solvedBy: {
                    some: {
                        userId: req.user.id,
                    }
                }
            },
            include: {
                solvedBy: {
                    where: {
                        userId: req.user.id,
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            message: "Problems Fetched Successfully!",
            problems
        })

    } catch (error) {
        console.error("Error Fetching Problems: ", error);
        
        return res.status(500).json({
            success: false,
            message: "Failed to Fetched Problems!"
        })
    }
}


export {createProblem, getAllProblems, getProblemById, updateProblem, deleteProblem, getAllProblemsSolvedByUser}