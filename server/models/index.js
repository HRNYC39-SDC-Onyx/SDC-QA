const pool = require('../db/index');

/*

        QUESTIONS TABLE QUERIES

*/

// query to get all questions related to product_id
const productQuestions = ({ product_id, page = 1, count = 5 }) => {
  const query = {
    name: 'get-questions',
    text: `
      select
          q.question_id,
          q.question_body,
          q.question_date,
          q.asker_name,
          q.helpful as question_helpfulness,
          case when q.reported > 0 then true else false end as reported,
          jsonb_object_agg(
                a.id,
                json_build_object(
                  'id', a.id,
                  'body', a.body,
                  'date', a.date_written,
                  'answerer_name', a.answerer_name,
                  'helpfulness', a.helpful,
                  'photos', (
                    select ARRAY(
                      SELECT row_to_json(ap)
                      from answers_photos as ap
                      where ap.answer_id = a.id
                      )
                    )
                  )
          ) as answers
      from answers as a
      inner join questions as q
      on q.question_id = a.question_id
      where q.product_id=$1
      group by 1;`,
    values: [product_id],
  };
  return pool.query(query);
};

/*

        answers table queries

*/

// query to get all answers related to question
const productQuestionAnswers = (question_id, page = 1, count = 5) => {
  // console.log('question id in models', question_id);
  const query = {
    name: 'get-question-answers',
    text: `SELECT row_to_json (sub)
          FROM (SELECT id, body, date_written as date, answerer_name,
          helpful as helpfulness FROM answers WHERE question_id=$1) as sub`,
    values: [question_id],
  };
  return pool.query(query);
};

// query to get all photos associated with an answer
const productQuestionAnswersPhotos = (answer_id) => {
  const query = {
    name: 'get-question-answers_photos',
    text: `SELECT id, url FROM answers_photos WHERE answer_id=$1`,
    values: [answer_id],
  };
  return pool.query(query);
};

/*

        UPDATE QUERIES

*/
// questions and answers tables -> helpful and reported -> increment and decrement
const markQuestionAsHelpful = (question_id) => {
  const query = {
    name: '',
    text: `UPDATE questions SET helpful = helpful + 1 where question_id = $1`,
    values: [question_id],
  };
  pool.query(query);
};

const reportQuestion = (question_id) => {
  const query = {
    name: '',
    text: `UPDATE questions SET reported = reported + 1 where question_id = $1`,
    values: [question_id],
  };
  pool.query(query);
};

const markAnswerAsHelpful = (id) => {
  const query = {
    name: '',
    text: `UPDATE answers SET helpful = helpful + 1 where id = $1`,
    values: [id],
  };
  pool.query(query);
};

const reportAnswer = (id) => {
  const query = {
    name: '',
    text: `UPDATE answers SET reported = reported + 1 where id = $1`,
    values: [id],
  };
  pool.query(query);
};

module.exports = {
  productQuestions,
  productQuestionAnswers,
  productQuestionAnswersPhotos,
  markQuestionAsHelpful,
  markAnswerAsHelpful,
  reportQuestion,
  reportAnswer,
};

/*

    test queries TODO: DELETE ME

*/

// const getQuestionsAnswersJoinTestQuery = `explain analyze SELECT * FROM questions where product_id=39334 LIMIT 10 `;
// const testJoin = pool.query(getQuestionsAnswersJoinTestQuery);
// testJoin.then((data) => console.log('test join', data.rows));

// const getTenQuestionsJSON = `SELECT row_to_json(questions) FROM questions LIMIT 10`;
// const test = pool.query(getTenQuestionsJSON);
// test.then((data) => console.log('data here 🎃', data.rows));

// const getTenQuestions = `SELECT * FROM questions LIMIT 10`;
// const testNotJSON = pool.query(getTenQuestions);
// testNotJSON.then((data) => console.log('not json data', data.rows));

// const test2 = pool.query(getTenAnswers);

// test2.then((data) => console.log('answers ⛰', data.rows));

// answers_photos
// const getTenPhotos = `SELECT * FROM answers_photos LIMIT 10`;

// const test3 = pool.query(getTenPhotos);

// const getTenAnswers = `SELECT * FROM answers LIMIT 10`;

// test3.then((data) => console.log('photos ⛽️', data.rows));

// const getTenQuestions = `SELECT * FROM questions LIMIT 10`;

// const test = pool.query(getTenQuestions);

// const questionInsertQuery = `INSERT INTO questions(
//   id, product_id, body, date_written,
//   asker_name, asker_email, reported,
//   helpful) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;

// /* pool.query(
//   questionInsertQuery,
//   [
//     id,
//     product_id,
//     body,
//     date_written,
//     asker_name,
//     asker_email,
//     reported,
//     helpful,
//   ],
//   (err, res) => {
//     if (err) {
//       console.log('🔴🔴🔴🔴🔴🔴🔴🔴', err);
//     }
//   }
// ); */
