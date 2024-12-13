const request = require('supertest');
const app = require('../server'); // Adjust the path to your app.js file


jest.mock('../config/config', () => {
    return {
        query: jest.fn(),
    };
});

const mockDb = require('../config/config');

describe('POST /create_new_tender', () => {
    it('should create a new tender successfully', async () => {
        mockDb.query.mockResolvedValueOnce({ rows: [{ tender_id: 'tender_1719822085000' }] });

        const response = await request(app)
            .post('/create_new_tender')
            .send({
                tender_title: "Test Tender",
                tender_slug: "http://localhost:8002/test-tender",
                tender_desc: "This is a test tender which is created for test purpose",
                tender_cat: "Cat1",
                tender_opt: "Public",
                emd_amt: "1000",
                emt_lvl_amt: "500^100^100^100^100",
                attachments: { key: "itemKey1", type: ".jpg", max_size: "10mb" },
                custom_form: "<!DOCTYPE html><html><head><title>Sample Form</title></head><body><form><div><label for='exampleInputEmail1'>Email address</label><input type='email' id='exampleInputEmail1' placeholder='Enter email'></div><div><label for='exampleInputPassword1'>Password</label><input type='password' id='exampleInputPassword1' placeholder='Password'></div><div><input type='checkbox' id='exampleCheck1'><label for='exampleCheck1'>Check me out</label></div><button type='submit'>Submit</button></form></body></html>",
                currency: "INR",
                start_price: "100",
                qty: "1000",
                dest_port: "Delhi",
                bag_size: "10",
                bag_type: "Packet",
                measurement_unit: "Bag",
                app_start_time: 1719822085000,
                app_end_time: 1719822085000,
                auct_start_time: 1719822085000,
                auct_end_time: 1719822085000,
                time_frame_ext: 300000,
                extended_at: 1719822085000,
                amt_of_ext: 300000,
                aut_auct_ext_bfr_end_time: 1719822085000,
                min_decr_bid_val: 20,
                timer_ext_val: 300000,
                qty_split_criteria: "500^100^100^100^100",
                counter_offr_accept_timer: 300000,
                img_url: "https://www.google.com/url?sa=i&url=https%3A%2F%2Ffilesamples.com%2Fformats%2Fjpg&psig=AOvVaw0Fsp1ofyjywysYapgOqqll&ust=1719908702124000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCMj5_qq1hYcDFQAAAAAdAAAAABAJ",
                auction_type: "Reverse",
                tender_id: "tender_1719822085000",
                audi_key: "aud_1719822085000"
            });

        expect(response.status).toBe(201);
        expect(response.body.msg).toBe('Tender created successfully');
        expect(response.body.tender_id).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
        const response = await request(app)
            .post('/create_new_tender')
            .send({
                tender_title: "Test Tender",
                // Missing other required fields
            });

        expect(response.status).toBe(400);
        expect(response.body.msg).toBe('At least one field must be provided for the creation');
    });

    it('should return 500 if there is a database error', async () => {
        mockDb.query.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .post('/create_new_tender')
            .send({
                tender_title: "Test Tender",
                tender_slug: "http://localhost:8002/test-tender",
                tender_desc: "This is a test tender which is created for test purpose",
                tender_cat: "Cat1",
                tender_opt: "Public",
                emd_amt: "1000",
                emt_lvl_amt: "500^100^100^100^100",
                attachments: { key: "itemKey1", type: ".jpg", max_size: "10mb" },
                custom_form: "<!DOCTYPE html><html><head><title>Sample Form</title></head><body><form><div><label for='exampleInputEmail1'>Email address</label><input type='email' id='exampleInputEmail1' placeholder='Enter email'></div><div><label for='exampleInputPassword1'>Password</label><input type='password' id='exampleInputPassword1' placeholder='Password'></div><div><input type='checkbox' id='exampleCheck1'><label for='exampleCheck1'>Check me out</label></div><button type='submit'>Submit</button></form></body></html>",
                currency: "INR",
                start_price: "100",
                qty: "1000",
                dest_port: "Delhi",
                bag_size: "10",
                bag_type: "Packet",
                measurement_unit: "Bag",
                app_start_time: 1719822085000,
                app_end_time: 1719822085000,
                auct_start_time: 1719822085000,
                auct_end_time: 1719822085000,
                time_frame_ext: 300000,
                extended_at: 1719822085000,
                amt_of_ext: 300000,
                aut_auct_ext_bfr_end_time: 1719822085000,
                min_decr_bid_val: 20,
                timer_ext_val: 300000,
                qty_split_criteria: "500^100^100^100^100",
                counter_offr_accept_timer: 300000,
                img_url: "https://www.google.com/url?sa=i&url=https%3A%2F%2Ffilesamples.com%2Fformats%2Fjpg&psig=AOvVaw0Fsp1ofyjywysYapgOqqll&ust=1719908702124000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCMj5_qq1hYcDFQAAAAAdAAAAABAJ",
                auction_type: "Reverse",
                tender_id: "tender_1719822085000",
                audi_key: "aud_1719822085000"
            });

        expect(response.status).toBe(500);
        expect(response.body.msg).toBe('Error creating tender');
        expect(response.body.error).toBe('Database error');
    });
});
