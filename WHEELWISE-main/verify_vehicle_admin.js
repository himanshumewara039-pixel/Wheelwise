const ds = require('./src/dataStore');

(async () => {
  const add = await ds.addVehicle({ name: 'QA Bike', price: 777, type: 'Bike', status: 'Available' });
  console.log('ADD_SUCCESS=' + add.success);
  console.log('ADD_ID=' + add.vehicle.id);

  const list = await ds.listVehicles();
  console.log('HAS_QA=' + list.some((v) => v.name === 'QA Bike' && Number(v.price) === 777));

  const del = await ds.deleteVehicle(add.vehicle.id);
  console.log('DELETE_SUCCESS=' + del.success);

  const remains = await ds.listVehicles();
  console.log('REMOVED=' + remains.some((v) => Number(v.id) === Number(add.vehicle.id)));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
