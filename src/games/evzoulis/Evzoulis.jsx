import { useNavigate } from 'react-router-dom'
import BigButton from '../../components/BigButton.jsx'

// Placeholder — το παιχνίδι του Άλεξ. ΜΗΝ το αγγίζεις.
export default function Evzoulis() {
  const navigate = useNavigate()
  return (
    <div className="screen coming-soon coming-soon--evzoulis">
      <div className="coming-soon__emoji">🎖️</div>
      <h1 className="coming-soon__title">Ευζούλης</h1>
      <p className="coming-soon__text">Σύντομα κοντά σας!</p>
      <BigButton variant="neutral" onClick={() => navigate('/')}>
        ← Πίσω στην αρχή
      </BigButton>
    </div>
  )
}
