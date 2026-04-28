// importing http and fs
const http = require("http")
const fs   = require("fs")

// initialising the PORT
const PORT = 3000

// creating the server
const server = http.createServer((req, res) => {

    // show the form when user opens the page
    if (req.url === "/" && req.method === "GET") {
        fs.readFile("protectaccess.html", "utf-8", (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" })
                res.end("Error reading the file")
            } else {
                res.writeHead(200, { "Content-Type": "text/html" })
                res.end(data)
            }
        })
    }

    // when user clicks Submit
    else if (req.url === "/protectaccess" && req.method === "POST") {
        let body = ""

        req.on("data", (chunk) => {
            body += chunk.toString()
        })

        req.on("end", () => {

            // get each value from the form
            const parsedData = new URLSearchParams(body)
            const name       = parsedData.get("name")
            const password   = parsedData.get("pw")
            const ID         = parsedData.get("IDnumber")

            // checking that inputs are received
            console.log(name, password, ID)

            // validate name, so it means that it must not be empty and must not be numbers only
            const validName = name.trim() !== "" && !/^\d+$/.test(name)

            // validate password: at least 10 characters, must have letters and numbers
            const validPassword = password.length >= 10 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)

            // validate ID: exactly 12 digits, dashes allowed between groups of 3, no dots, no other characters
            const validID = /^\d{3}-\d{3}-\d{3}-\d{3}$|^\d{12}$/.test(ID)

            // check if everything is valid
            const allValid = validName && validPassword && validID

            console.log("name valid:", validName)
            console.log("password valid:", validPassword)
            console.log("ID valid:", validID)

            // mask password with stars and remove dashes from ID
            let maskedPassword = "*".repeat(password.length)
            let displayedID    = ID.replace(/-/g, "")

            // if all inputs are valid
            if (allValid) {
                res.writeHead(200, { "Content-Type": "text/html" })

                // append the result into accessresults.txt
                fs.appendFile("accessresults.txt", `\n\nSuccessful\n${name}, ${maskedPassword}, ${displayedID}`, (err) => {
                    if (err) {
                        console.log("Error writing to file")
                    } else {

                        // read the file (required by the question) but do not display it
                        fs.readFile("accessresults.txt", "utf-8", (err, fileContent) => {
                            if (err) {
                                console.log("Error reading file")
                            } else {

                                // only show the heading and the submitted details
                                res.end(`
                                    <h1 style="color: green;">Successful.</h1>
                                    <p>${name}, ${maskedPassword}, ${displayedID}</p>
                                    <br><a href="/">Go back to form</a>
                                `)
                            }
                        })
                    }
                })

            // if any input is invalid
            } else {
                res.writeHead(200, { "Content-Type": "text/html" })

                // append the result into accessresults.txt
                fs.appendFile("accessresults.txt", `\n\nAccess Denied! Invalid Data\n${name}, ${maskedPassword}, ${displayedID}`, (err) => {
                    if (err) {
                        console.log("Error writing to file")
                    } else {

                        // read the file (required by the question) but do not display it
                        fs.readFile("accessresults.txt", "utf-8", (err, fileContent) => {
                            if (err) {
                                console.log("Error reading file")
                            } else {

                                // only show the heading and the submitted details
                                res.end(`
                                    <h1 style="color: red;">Access Denied! Invalid data.</h1>
                                    <p>${name}, ${maskedPassword}, ${displayedID}</p>
                                    <br><a href="/">Go back to form</a>
                                `)
                            }
                        })
                    }
                })
            }
        })
    }
})

server.listen(PORT, () => {
    console.log("Server running on port", PORT)
})