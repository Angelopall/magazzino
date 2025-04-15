import Header from './components/header'
import Footer from './components/footer'
import PalletCalculator from './components/PalletCalculator'
import './styles/App.css'

const App = () => {
  return (
    <>
      <Header />
      <div className="container">
        <PalletCalculator />
      </div>
      <Footer />
    </>
  )
}

export default App
