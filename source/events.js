const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const { ObjectId } = require('mongodb');

module.exports = function(app, db, client){
    //Form validation
    var eventsValidation = [
        check('title', 'Title field can\'t be empty')
            .isLength({ min: 1 }),

        check('description', 'Description field can\'t be empty')
            .isLength({ min: 32 }),
    ];


    app.get('/events', (req, res) => {
        db.collection('events').find().toArray(function(err, results) {
            if (err)
            {
                return console.log(err);
            }
            res.status(200).send(results);
        });
    });

    app.get('/events/:id', (req, res) => {
        var id = ObjectId(req.params.id);

        db.collection('events').find({'_id': id}).toArray(function(err, results) {
            if (err)
            {
                return console.log(err);
            }
            res.status(200).send(results);
        });
    });

    app.post('/events', eventsValidation, (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(422).json({ errors: errors.mapped(), datas: matchedData(req) });
        }
        else
        {
            db.collection('events').save(req.body, (err, result) => {
                if (err) {
                    return console.log(err);
                }
                var documentInserted = result['ops'][0];
                res.location('/events/' + documentInserted._id);
                res.status(201).send(null);
            });
        }
    });

    app.put('/events/:id', eventsValidation, (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(422).json({ errors: errors.mapped(), datas: matchedData(req) });
        }
        else
        {
            var id = ObjectId(req.params.id);
            db.collection('events').updateOne({'_id': id}, {$set : req.body}, (err, result) => {
                if (err || result.matchedCount == 0) {
                    res.status(204).send(null);
                }
                else
                {
                    res.status(200).send(null);
                }
            });
        }
    });

    app.put('/events/:id/members/:memberId', (req, res, next) => {
        var id = ObjectId(req.params.id);
        var memberId = req.params.memberId;
        db.collection('events').find({'_id': id}).toArray(function (err, result) {
            if (err || result.matchedCount == 0) {
                res.status(204).send(null);
            }
            else
            {
                var bToInsert = true;
                if (result[0].members === undefined)
                {
                    result[0].members = [];
                }
                else
                {
                    for (i = 0, c = result[0].members.length; i < c; i++)
                    {
                        if (result[0].members[i].id == memberId)
                        {
                            bToInsert = false;
                            break;
                        }
                    }
                }

                if (bToInsert)
                {
                    result[0].members.push({'id': ObjectId(memberId)});

                    db.collection('events').updateOne({'_id': id}, {$set : result[0]}, (err, result) => {
                        if (err || result.matchedCount == 0) {
                            res.status(204).send(null);
                        }
                        else
                        {
                            res.status(200).send(null);
                        }
                    });
                }
                else
                {
                    res.status(204).send(null);
                }
            }

        });

    });

    app.delete('/events/:id/members/:memberId', (req, res, next) => {
        var id = ObjectId(req.params.id);
        var memberId = req.params.memberId;
        db.collection('events').find({'_id': id, 'members.id': ObjectId(memberId)}).toArray(function (err, result) {
            if (err || result.matchedCount == 0) {
                res.status(204).send(null);
            }
            else
            {
                var aEvents = result[0];
                aEvents.members = [];
                for (i = 0, c = result[0].members.length; i < c; i++)
                {
                    if (result[0].members[i].id != memberId)
                    {
                        aEvents.members.push(result[0].members[i]);
                    }
                }

                db.collection('events').updateOne({'_id': id}, {$set : result[0]}, (err, result) => {
                    if (err || result.matchedCount == 0) {
                        res.status(204).send(null);
                    }
                    else
                    {
                        res.status(200).send(null);
                    }
                });
            }

        });

    });
}
