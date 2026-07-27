import BigButton from '../../../components/BigButton.jsx'

// Αποστολή 2 — placeholder. Θα φτιαχτεί αργότερα.
export default function Mission2LunchBox({ onNext }) {
  return (
    <div className="mission mission--soon">
      <div className="mission--soon__emoji">🎒</div>
      <h2 className="mission--soon__title">Αποστολή 2: Το κολατσιό</h2>
      <p className="mission--soon__text">Σύντομα κοντά σας!</p>
      <BigButton variant="primary" onClick={onNext}>
        Επόμενη αποστολή →
      </BigButton>
    </div>
  )
}
