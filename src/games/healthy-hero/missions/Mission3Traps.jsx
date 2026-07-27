import BigButton from '../../../components/BigButton.jsx'

// Αποστολή 3 — placeholder. Θα φτιαχτεί αργότερα.
export default function Mission3Traps({ onNext }) {
  return (
    <div className="mission mission--soon">
      <div className="mission--soon__emoji">⚠️</div>
      <h2 className="mission--soon__title">Αποστολή 3: Οι παγίδες</h2>
      <p className="mission--soon__text">Σύντομα κοντά σας!</p>
      <BigButton variant="primary" onClick={onNext}>
        Τέλος παιχνιδιού →
      </BigButton>
    </div>
  )
}
