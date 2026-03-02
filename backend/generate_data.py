import numpy as np
import pandas as pd

np.random.seed(42)
n = 1500

data = pd.DataFrame({
    "molasses_ton": np.random.uniform(50, 500, n),
    "fermentation_eff": np.random.uniform(0.85, 0.95, n),
    "dehydration_eff": np.random.uniform(0.90, 0.98, n),
    "atj_eff": np.random.uniform(0.60, 0.75, n),
    "energy_input": np.random.uniform(800, 1400, n)
})

data["ethanol_liters"] = data["molasses_ton"] * np.random.uniform(220, 260)

data["saf_output"] = (
    data["ethanol_liters"]
    * data["fermentation_eff"]
    * data["dehydration_eff"]
    * data["atj_eff"]
) / 1000

data.to_csv("saf_dataset.csv", index=False)
print("Dataset generated!")