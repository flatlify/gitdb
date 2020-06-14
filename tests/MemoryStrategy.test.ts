import MemoryStrategy from '../src/MemoryStrategy';

describe('getAll', () => {
  test('Can access data after creating', async () => {
    const memoryStrategy = new MemoryStrategy([
      { id: '0', integer: 4 },
      { id: '1', integer: 5 },
    ]);
    const data = await memoryStrategy.getAll();
    expect(data[1].integer).toBe(5);
  });

  test('Collection data is immutable', async () => {
    const memoryStrategy = new MemoryStrategy([{ id: '0', a: 4 }]);

    const data = await memoryStrategy.getAll();
    data[0].a = 5;

    const newData = await memoryStrategy.getAll();

    expect(newData[0].a).toBe(4);
  });

  test('Works with an empty array', async () => {
    const memoryStrategy = new MemoryStrategy([]);
    const data = await memoryStrategy.getAll();

    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBe(0);
  });
});

describe('getData', () => {
  test('Can filter data', async () => {
    const memoryStrategy = new MemoryStrategy([
      { id: '0', integer: 4 },
      { id: '1', integer: 5 },
      { id: '2', integer: 1 },
    ]);
    const data = await memoryStrategy.getData((e) => e.integer > 3);

    expect(data.length).toBe(2);
  });

  test('Works with an empty array', async () => {
    const memoryStrategy = new MemoryStrategy([]);

    const data = await memoryStrategy.getData(() => true);

    expect(data.length).toBe(0);
  });
});

describe('insert', () => {
  test('Can insert data in filled array', async () => {
    const memoryStrategy = new MemoryStrategy([
      { id: '0', integer: 4 },
      { id: '1', integer: 5 },
      { id: '2', integer: 1 },
    ]);
    await memoryStrategy.insert({ id: '24', integer: 24 });

    const data = await memoryStrategy.getAll();
    expect(data.length).toBe(4);

    const insertedItem = (
      await memoryStrategy.getData((e) => e.integer === 24)
    )[0];

    expect(insertedItem.integer).toBe(24);
  });

  test('Can insert data in an empty array', async () => {
    const memoryStrategy = new MemoryStrategy<{ id: string; integer: number }>(
      [],
    );
    await memoryStrategy.insert({ id: '24', integer: 24 });

    const data = await memoryStrategy.getAll();
    expect(data.length).toBe(1);

    const insertedItem = (
      await memoryStrategy.getData((e) => e.integer === 24)
    )[0];

    expect(insertedItem.integer).toBe(24);
  });

  test('Can insert multiple elements', async () => {
    const memoryStrategy = new MemoryStrategy<{ id: string; integer: number }>(
      [],
    );
    await memoryStrategy.insert({ id: '24', integer: 24 });
    await memoryStrategy.insert({ id: '25', integer: 234 });
    await memoryStrategy.insert({ id: '26', integer: 34 });

    const data = await memoryStrategy.getAll();
    expect(data.length).toBe(3);

    const insertedItems = await memoryStrategy.getData((e) => e.integer > 30);
    expect(insertedItems.length).toBe(2);
  });
});

describe('update', () => {
  test('Can update data', async () => {
    const OLD_VALUE = 1;
    const NEW_VALUE = 25;

    const memoryStrategy = new MemoryStrategy([
      { id: '0', integer: 4, searchValue: 1 },
      { id: '1', integer: 4, searchValue: 1 },
      { id: '2', integer: OLD_VALUE, searchValue: 0 },
    ]);

    await memoryStrategy.update(
      (e) => e.integer === 4,
      (e) => ({ ...e, integer: NEW_VALUE }),
    );

    const updatedData = await memoryStrategy.getData(
      (e) => e.searchValue === 1,
    );

    updatedData.forEach((e) => expect(e.integer === NEW_VALUE));
  });

  test("Doesn't not modify id", async () => {
    const OLD_ID = '2';
    const memoryStrategy = new MemoryStrategy([
      { id: '0', integer: 1 },
      { id: '1', integer: 2 },
      { id: '2', integer: 3 },
    ]);

    await memoryStrategy.update(
      (e) => e.integer === 3,
      (e) => ({ ...e, id: '24' }),
    );

    const updatedData = (
      await memoryStrategy.getData((e) => e.integer === 3)
    )[0];
    expect(updatedData.id).toBe(OLD_ID);
  });

  test("Doesn't not modify wrong data", async () => {
    const OLD_VALUE = 1;
    const NEW_VALUE = 25;

    const memoryStrategy = new MemoryStrategy([
      { id: '0', integer: 4, searchValue: 1 },
      { id: '1', integer: 4, searchValue: 1 },
      { id: '2', integer: OLD_VALUE, searchValue: 0 },
    ]);

    await memoryStrategy.update(
      (e) => e.integer === 4,
      (e) => ({ ...e, integer: NEW_VALUE }),
    );

    const unUpdatedData = await memoryStrategy.getData(
      (e) => e.searchValue === 0,
    );

    unUpdatedData.forEach((e) => expect(e.integer === OLD_VALUE));
  });

  test('Works without data', async () => {
    const memoryStrategy = new MemoryStrategy<{ id: string; integer: number }>(
      [],
    );
    await memoryStrategy.update(
      (e) => e.integer === 4,
      (e) => ({ ...e, integer: 5 }),
    );
    const data = await memoryStrategy.getAll();
    expect(data.length).toBe(0);
  });
});

describe('delete', () => {
  test('Can delete data', async () => {
    const memoryStrategy = new MemoryStrategy([
      { id: '0', integer: 4, searchValue: 1 },
      { id: '1', integer: 4, searchValue: 1 },
      { id: '2', integer: 1, searchValue: 0 },
    ]);

    await memoryStrategy.delete((e) => e.integer === 4);

    const updatedData = await memoryStrategy.getData(
      (e) => e.searchValue === 1,
    );

    expect(updatedData.length).toBe(0);
  });

  test("Doesn't not delete wrong data", async () => {
    const memoryStrategy = new MemoryStrategy([
      { id: '0', integer: 4, searchValue: 1 },
      { id: '1', integer: 4, searchValue: 1 },
      { id: '2', integer: 1, searchValue: 0 },
    ]);

    await memoryStrategy.delete((e) => e.integer === 4);

    const updatedData = await memoryStrategy.getData(
      (e) => e.searchValue === 0,
    );

    expect(updatedData.length).toBe(1);
  });

  test('Works without data', async () => {
    const memoryStrategy = new MemoryStrategy<{ id: string; integer: number }>(
      [],
    );

    await memoryStrategy.delete((e) => e.integer === 4);
    const data = await memoryStrategy.getAll();

    expect(data.length).toBe(0);
  });
});
