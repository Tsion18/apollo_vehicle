let express = require('express');
let { Pool } = require("pg");
let env = require('../env.json');

let hostname = 'localhost';
let port = 3000;
let app = express();

app.use(express.json());

let pool = new Pool(env);
pool.connect().then(result => {
    console.log(`Connected to database ${result.database}`);
});

//API Endpoints
app.get('/vehicle', (req, res) => {
    pool.query('SELECT * FROM vehicle')
    .then(result => {
        res.json(result.rows);
    })
    .catch(error => {
        handleError(error, res);
    });
});

app.get('/vehicle/:vin', (req, res) => {
    let vin = req.params.vin;

    if (vin.length > 17) {
        return res.status(400).json({ error: 'Invalid VIN format' });
    }

    pool.query('SELECT * FROM vehicle WHERE vin = $1', [vin])
    .then(result => {
        if (result.rows.length == 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        res.json(result.rows[0]);
    }).catch(error => {
        handleError(error, res);
    });
});

app.post('/vehicle', (req, res) => {
    let vehicle = req.body;
    if (!vehicle || Object.keys(vehicle).length == 0) {
        return res.status(400).json({ error: 'Request body must be a JSON representation of a vehicle' });
    }

    const {
        manufacturer_name,
        description,
        horsepower,
        model_name,
        model_year,
        purchase_price,
        fuel_type
    } = vehicle;
    
    let errors = validateVehicle(vehicle);

    if (errors.length > 0) {
        return res.status(422).json({ errors });
    }

    pool.query(`INSERT INTO vehicle 
        (manufacturer_name, description, horsepower, model_name, model_year, purchase_price, fuel_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [manufacturer_name, description || null, horsepower, model_name, model_year, purchase_price, fuel_type]
    ).then( result => {
        res.status(201).json(result.rows[0])
    }).catch( error => {
        handleError(error, res);
    });
});

app.put('/vehicle/:vin', (req, res) => {
    let vin = req.params.vin;
    let vehicle = req.body;

    if (!vehicle || Object.keys(vehicle).length == 0) {
        return res.status(400).json({ error: 'Request body must be a JSON representation of a vehicle' });
    }

    const {
        manufacturer_name,
        description,
        horsepower,
        model_name,
        model_year,
        purchase_price,
        fuel_type
    } = vehicle;

    let errors = validateVehicle(vehicle);

    if (errors.length > 0) {
        return res.status(422).json({ errors });
    }

    pool.query(
        `UPDATE vehicle 
         SET manufacturer_name = $1, 
         description = $2, 
         horsepower = $3, 
         model_name = $4, 
         model_year = $5, 
         purchase_price = $6, 
         fuel_type = $7
         WHERE vin = $8
         RETURNING *`,
        [manufacturer_name, description || null, horsepower, model_name, model_year, purchase_price, fuel_type, vin]
    )
    .then(result => {
        if (result.rowCount == 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        res.status(200).json(result.rows[0]);
    })
    .catch(error => {
        handleError(error, res);
    });
});

app.delete('/vehicle/:vin', (req, res) => {
    let vin = req.params.vin;

    pool.query('DELETE FROM vehicle WHERE vin = $1', [vin])
    .then( result => {
        if(result.rowCount == 0){
            return res.status(404).json({error : 'Vehicle not found'});
        }

        res.sendStatus(204);
    })
    .catch( error => {
        handleError(error, res);
    });
});


function handleError(error, res) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
}

function validateVehicle(vehicle) {
    const {
        manufacturer_name,
        description,
        horsepower,
        model_name,
        model_year,
        purchase_price,
        fuel_type
    } = vehicle;

    let errors = [];

    if (!manufacturer_name || typeof manufacturer_name !== 'string') {
        errors.push("manufacturer_name is required and must be a string");
    }

    if (horsepower === undefined || typeof horsepower !== 'number' || horsepower <= 0) {
        errors.push("horsepower is required and must be a positive number");
    }

    if (!model_name || typeof model_name !== 'string') {
        errors.push("model_name is required and must be a string");
    }

    if (model_year === undefined || typeof model_year !== 'number' || model_year < 1886 || model_year > new Date().getFullYear() + 1) {
        errors.push("model_year is required and must be a valid year");
    }

    if (purchase_price === undefined || typeof purchase_price !== 'number' || purchase_price < 0) {
        errors.push("purchase_price is required and must be a non-negative number");
    }
    
    if (!fuel_type || typeof fuel_type !== 'string') {
        errors.push("fuel_type is required and must be a string");
    }
    
    return errors;  
}

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'Malformed JSON'
        });
    }
    next(err);
});

app.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}`);
});