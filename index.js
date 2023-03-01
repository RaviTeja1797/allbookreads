const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json())
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3006, () => {
      console.log("Server Running at http://localhost:3006/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  console.log(request.params);

  const getBookQuery = `
        SELECT *
        FROM book
        WHERE book_id = ${bookId}
    `;

  const book = await db.get(getBookQuery);
  response.send(book);
});

//add book API

app.post('/books/', async(request, response)=>{
    const bookDetails = request.body;
    const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

    const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
      try{
        const dbResponse = await db.run(addBookQuery)
        const newlyAddedRecordQuerry = `
        SELECT * FROM Book Where book_id = ${dbResponse.lastID}
        `        
        let newlyAddedRecord = await db.get(newlyAddedRecordQuerry)
        console.log(newlyAddedRecord)
        response.send(`New record has been added with ID${dbResponse.lastID}
        and the record is 
        ${JSON.stringify(newlyAddedRecord)}`)
      }catch(e){
        console.log(e.message)
      }
      
})