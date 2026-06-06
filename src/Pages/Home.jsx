import Header from "../Component/Header";
import SpecialityMenu from "../Component/SpecialityMenu";
import TopDoctor from "../Component/TopDoctor";
import Banner from "../Component/Banner";

export default function Home() {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctor />
      <Banner />
    </div>
  );
}
