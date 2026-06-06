import { createContext, useContext } from "react";
import {
  assets,
  specialityData,
} from "../assets/prescripto_assets/assets/assets_frontend/assets";
import config from "../config";
import { formatMoney } from "../utils/format";

export const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const AppContextProvider = ({ children }) => {
  const value = {
    assets,
    specialities: specialityData,
    currency: config.currency,
    appName: config.appName,
    formatMoney,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
