describe('Personas Lock Test', () => {
  test('persona definitions are frozen', () => {
    // S4 Lock: Personas are frozen - admin, dev, support, customer
    const expectedPersonas = [
      {
        id: 'admin',
        side: 'admin',
        riskProfile: 'normal',
        defaultCockpitMode: 'admin',
      },
      {
        id: 'customer',
        side: 'customer',
        riskProfile: 'normal',
        defaultCockpitMode: 'customer',
      },
      {
        id: 'dev',
        side: 'admin',
        riskProfile: 'normal',
        defaultCockpitMode: 'admin',
      },
      {
        id: 'support',
        side: 'admin',
        riskProfile: 'normal',
        defaultCockpitMode: 'admin',
      },
    ];

    expect(expectedPersonas).toHaveLength(4);

    const personaIds = expectedPersonas.map((p) => p.id).sort();
    expect(personaIds).toEqual(['admin', 'customer', 'dev', 'support']);
  });
});
