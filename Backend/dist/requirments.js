// backend workflow 
// user logic -> user should be able to login using metamask, and the metamask modal should automatically opens up as soon as the site is loaded and should connect with the wallet that holds btc and as soon as that happens it should make call to get all the cart items and orders palced by user (if any),
// user should be able all the stores that are live on this platform and all the products that the admin offers in the landing page,
// he should see all the prices in btc (live conversion), 
//  he should be able to visit a store page and see all the products that store has to offer, 
// he should be able to add products to his cart and products shall be seperated by the seller like all the products of one seller are grouped together and products of other seller are grouped in other collection 
// he should be able to buy the product which would mean that he should be able to pay to merchant selling this and only after verification that the payment been made then only the order will be placed on the printfull for further investigation
export {};
// merchant logic 
// he should be able to create his store , add banner, store logo , description types of products he selles and then the array of products 
// all his products will be fetched from his printfull account, 
// his api-key must be checked before storing it in database also i need to get the store-id from this api key 
// he should have some money on his printfull account , cause i'll make the order first and only when the order has status draft then only i'll prompt user to make payment, 
// 
// todo - complete printful integration 
// update the create merchant logic add the api key store id in the database 
// have to create a delete a product from the cart route
// have to create a cart product quantity update route 
// have create order route 
// have to send the mail to the informing him about the order made, 
// have to open the metamask modal for payment 
// 
