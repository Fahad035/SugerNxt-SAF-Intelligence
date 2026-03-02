export const SCENARIO_PRESETS = {
  Conservative: {
    input: {
      molasses_ton: 140,
      fermentation_eff: 0.87,
      dehydration_eff: 0.91,
      atj_eff: 0.64,
      energy_input: 1180,
      ethanol_factor: 228,
    },
  },
  Base: {
    input: {
      molasses_ton: 200,
      fermentation_eff: 0.9,
      dehydration_eff: 0.95,
      atj_eff: 0.7,
      energy_input: 1000,
      ethanol_factor: 240,
    },
  },
  Aggressive: {
    input: {
      molasses_ton: 300,
      fermentation_eff: 0.94,
      dehydration_eff: 0.97,
      atj_eff: 0.74,
      energy_input: 860,
      ethanol_factor: 252,
    },
  },
};

export const preparePayload = (inputs) => ({
  molasses_ton: Number(inputs.molasses_ton),
  fermentation_eff: Number(inputs.fermentation_eff),
  dehydration_eff: Number(inputs.dehydration_eff),
  atj_eff: Number(inputs.atj_eff),
  energy_input: Number(inputs.energy_input),
  ethanol_liters: Number(inputs.molasses_ton) * Number(inputs.ethanol_factor),
});

export const estimateSafFromInputs = (payload) => {
  const estimated =
    (payload.ethanol_liters *
      payload.fermentation_eff *
      payload.dehydration_eff *
      payload.atj_eff) /
    1000;

  return Number(estimated.toFixed(3));
};

export const deriveOutputs = (predictedSaf, payload) => {
  const safYield = Number(predictedSaf);
  const carbonSavings = safYield * 2500;
  const revenue = safYield * 1200;
  const feedstockCost = payload.molasses_ton * 150;
  const energyCost = payload.energy_input * 0.08;
  const operatingCost = safYield * 140;
  const totalCost = feedstockCost + energyCost + operatingCost;
  const netProfit = revenue - totalCost;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  return {
    safYield,
    carbonSavings,
    roi,
    revenue,
    feedstockCost,
    energyCost,
    operatingCost,
    totalCost,
    netProfit,
  };
};

export const createSensitivityData = (payload) => {
  const points = [];
  for (let molasses = 60; molasses <= 500; molasses += 40) {
    const samplePayload = {
      ...payload,
      molasses_ton: molasses,
      ethanol_liters: molasses * (payload.ethanol_liters / payload.molasses_ton),
    };

    points.push({
      molasses,
      saf: estimateSafFromInputs(samplePayload),
    });
  }
  return points;
};

export const createCarbonVsEfficiencyData = (payload) => {
  const points = [];
  for (let fermentationEff = 0.85; fermentationEff <= 0.96; fermentationEff += 0.01) {
    const samplePayload = {
      ...payload,
      fermentation_eff: Number(fermentationEff.toFixed(2)),
    };

    const saf = estimateSafFromInputs(samplePayload);
    points.push({
      efficiency: Number((fermentationEff * 100).toFixed(0)),
      carbon: Number((saf * 2500).toFixed(2)),
    });
  }
  return points;
};

export const buildWaterfallData = (outputs) => {
  const rows = [
    { name: "Revenue", delta: outputs.revenue },
    { name: "Feedstock", delta: -outputs.feedstockCost },
    { name: "Energy", delta: -outputs.energyCost },
    { name: "Operations", delta: -outputs.operatingCost },
  ];

  let running = 0;
  const waterfall = rows.map((row) => {
    const start = running;
    running += row.delta;

    return {
      name: row.name,
      base: Math.min(start, running),
      amount: Math.abs(row.delta),
      rawDelta: row.delta,
      positive: row.delta >= 0,
    };
  });

  waterfall.push({
    name: "Net",
    base: 0,
    amount: Math.abs(running),
    rawDelta: running,
    positive: running >= 0,
  });

  return waterfall;
};
