const path = require('path')
const mali = require('mali')
const express = require('express')
const mongo = require('mongodb')
const grpc_module = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const cookieParser = require('cookie-parser')

const REST_PORT = 8080
const GRPC_PORT = 50051
const DB_URL = 'mongodb://localhost'

const DB_RESTAURANTS = 'restaurants'

const USER_PROTO = path.resolve(__dirname, './proto/user.proto')
const PACKAGE_DEFINITION = protoLoader.loadSync(
    USER_PROTO,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
)

const PCKG_DEF_OBJ = grpc_module.loadPackageDefinition(PACKAGE_DEFINITION)
const user_route = PCKG_DEF_OBJ.user

const grpc = new mali(path.resolve(__dirname, './proto/restaurants.proto'), 'AppointmentCollision')
const rest = express()
const mongo_client = mongo.MongoClient;

function mongo_connect(res, callback) {
    mongo_client.connect(DB_URL, (err, db) => {
        if (err) {
            res.status(500).send({'error': err})
            console.error(err)
        }
        else {
            callback(err, db.db('ms-restaurants'))
            db.close()
        }
    })
}

rest.use(cookieParser())

rest.use(express.json())

rest.use((req, res, next) => {
    if (req.hostname == 'localhost') {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    }
    next()
})

rest.use('/restaurant', (req, res, next) => {
    if (res.cookies && res.cookies.uid) {
        res.status(400).send({'error': 'uid cookie not allowed'})
    } else {
        if (req.originalUrl.endsWith('/menu') || req.originalUrl.split('/').length == 3) {
            next()
        } else {
            user_token = {
                token: req.cookies.token
            }
            conn = new user_route.UserService('ms-buergerbuero:50051', grpc_module.credentials.createInsecure())
            conn.verifyUser(user_token, (err, feature) => {
                if (err) {
                    res.status(401).send({'error': err})
                } else {
                    res.cookies.uid = feature.uid
                    next()
                }
            })
        }
    }
})

rest.use('/my_restaurant', (req, res, next) => {
    next()
})

rest.get('/restaurants', (req, res) => {
    mongo_connect(res, (err, db) => {
        db.collection(DB_RESTAURANTS).find({}).toArray((err, result) => {
            var result_list = []
            for(var i of result) {
                result_list.push({'restaurantID': i.restaurantID, 'logo': i.logo, 'name': i.name, 'description': i.description})
            }
            res.send(result_list)
        })
    })
})

rest.get('/restaurant/:id', (req, res) => {
    mongo_connect(res, (err, db) => {
        db.collection('restaurants').findOne({restaurantID: req.params.id}, (err, result) => {
            if (err || result == null) {
                res.status(404).send({'error': 'Restaurant with id ' + req.params.id + ' not found'})
            } else {
                delete result.orders
                delete result.tables
                delete result.menu
                delete result._id
                res.send(result)
            }
        })
    })
})

rest.get('/restaurant/:id/menu', (req, res) => {
    mongo_connect(res, (err, db) => {
        db.collection('restaurants').findOne({restaurantID: req.params.id}, (err, result) => {
            if (err || result == null) {
                res.status(404).send({'error': 'Restaurant with id ' + req.params.id + ' not found'})
            } else {
                res.send(result.menu)
            }
        })
    })
})

rest.put('/restaurant/:id/order', (req, res) => {
// https://docs.mongodb.com/manual/reference/operator/update/push/
})

rest.put('/restaurant/:id/reserve_table', (req, res) => {

})

rest.get('/restaurant/:id/test', (req, res) => {
    res.send({'check': req.cookie.uid})
})

rest.put('/restaurant/create', (req, res) => {

})

rest.post('/my_restaurant/update', (req, res) => {

})

rest.put('/my_restaurant/menu/item', (req, res) => {

})

rest.post('/my_restaurant/menu/item', (req, res) => {
    
})

rest.delete('/my_restaurant/menu/item', (req, res) => {
    
})

rest.get('/my_restaurant/orders', (req, res) => {
    
})

rest.post('/my_restaurant/order/:id/accept', (req, res) => {
    
})

rest.post('/my_restaurant/order/:id/finish', (req, res) => {
    
})

rest.put('/my_restaurant/publish_deal', (req, res) => {
    
})

rest.get('/setupDB', (req, res) => {
    restaurant = {
        "restaurantID": "45f2xh-d46v421-2an3fz",
        "logo": "",
        "name": "Pizzeria Bolognese",
        "description": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est.",
        "ordersAllowed": true,
        "reservationsAllowed": true,
        "orders": [
            {
                "customerID": "123456789-abcdefgh",
                "dishes": [
                    {
                    'id': '2',
                    'name': 'Pizza Salami',
                    'price': 9.95,
                    'count': 2
                    }
                ]
            }
        ],
        "tables": [
            {
                "size": 4,
                "reservations": [
                    {
                        "customerID": "123456789-abcdefgh",
                        "time": "2020-06-30T18:00:00.000Z"
                    }
                ]
            },
            {
                "size": 2,
                "reservations": []
            },
            {
                "size": 2,
                "reservations": []
            }
        ],
        "openingHours": [
            {
                "from": "12:00",
                "to": "21:00"
            },
            {
                "from": "12:00",
                "to": "21:00"
            },
            {
                "from": "12:00",
                "to": "21:00"
            },
            {
                "from": "12:00",
                "to": "21:00"
            },
            {
                "from": "12:00",
                "to": "21:00"
            },
            {
                "from": "15:00",
                "to": "24:00"
            },
            {
                "from": "15:00",
                "to": "24:00"
            }
        ],
        "menu": [
            {
                'name': "Getränke",
                'dishes': [
                    {
                        'id': '1',
                        'name': 'Wasser',
                        'priceL': 2.95,
                        'priceXL': 3.95,
                        'description': 'Sprudelndes Quellwasser aus den Alpen.'
                    },
                    {
                        'id': '1a',
                        'name': 'Stilles Wasser',
                        'priceL': 1.95,
                        'priceXL': 2.95,
                        'description': 'Wasser aus dem Wasserhahn.'
                    },
                    {
                        'id': '2',
                        'name': 'Coca Cola',
                        'priceL': 4.95,
                        'priceXL': 5.95,
                        'description': ''
                    },
                    {
                        'id': '3',
                        'name': 'Bier',
                        'priceL': 5.95,
                        'priceXL': 7.95,
                        'description': 'Selbstgebrautes Bier aus dem Keller. Gekühlt.'
                    }
                ]
            },
            {
                'name': "Salate",
                'dishes': [
                    {
                        'id': '4',
                        'name': 'Salatauswahl',
                        'priceS': 4.95,
                        'priceL': 8.95,
                        'priceXL': 12.95,
                        'description': 'Lassen Sie sich überraschen mit einer Auswahl an feinsten Salaten.'
                    },
                    {
                        'id': '5',
                        'name': 'Kartoffelsalat',
                        'priceL': 6.95,
                        'description': 'Hausgemachter Kartoffelsalat vom Küchenchef.'
                    }
                ]
            },
            {
                'name': "Pizza",
                'dishes': [
                    {
                        'id': '6',
                        'name': 'Pizza Margherita',
                        'priceL': 7.95,
                        'priceXL': 9.95,
                        'description': 'Mit Tomate und Käse'
                    },
                    {
                        'id': '7',
                        'name': 'Pizza Salami',
                        'priceL': 9.95,
                        'priceXL': 11.95,
                        'description': 'Mit Tomate, Käse und Salami'
                    },
                    {
                        'id': '8',
                        'name': 'Pizza Prosciutto & Funghi',
                        'priceL': 10.95,
                        'priceXL': 12.95,
                        'description': 'Mit Tomate, Käse, Schinken und Champignons'
                    },
                    {
                        'id': '9',
                        'name': 'Pizza Tonno',
                        'priceL': 10.95,
                        'priceXL': 12.95,
                        'description': 'Mit Tomate, Käse, Thunfisch und Zwiebeln'
                    },
                    {
                        'id': '10',
                        'name': 'Pizza Calzone',
                        'priceL': 10.95,
                        'description': 'Mit Tomate, Käse, Salami, Schinken, Champignons und Paprika'
                    },
                    {
                        'id': '11',
                        'name': 'Pizza Gyros',
                        'priceL': 11.95,
                        'priceXL': 14.95,
                        'description': 'Mit Tomate, Käse und Gyros'
                    }
                ]
            }
        ]
    }
    mongo_connect(res, (err, db) => {
        db.collection(DB_RESTAURANTS).insertOne(restaurant, (err, db_res) => {
            if (err) {
                res.status(500).send({'error': err})
            } else {
                res.send()
            }
        })
    })
})

rest.get('/health', (req, res) => {
    res.send({'health': 'ok'})
})

function hasAppointmentCollision(ctx) {
    ctx.res = {
        "hasCollision": true
    }
}

grpc.use({hasAppointmentCollision})

function main() {
    grpc.start('0.0.0.0:' + GRPC_PORT)
    rest.listen(REST_PORT, () => {
        console.log('Rest Server started on port ' + REST_PORT)
    })
    console.log(DB_URL)
}

main()

module.exports = rest
