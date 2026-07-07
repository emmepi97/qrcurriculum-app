export const DICT = {
  it: {
    appName: 'QR Curriculum', dashboard: 'Dashboard', analytics: 'Analytics', radarSkill: 'Radar Skill', publicProfile: 'Profilo pubblico', logout: 'Logout', downloadPdf: 'Scarica PDF',
    homeTitle: 'Il tuo profilo professionale sempre aggiornato, misurabile e condivisibile.', homeSubtitle: 'Crea un CV online con URL professionale, QR code tracciato, analytics visite e radar delle competenze.',
    login: 'Accedi', signup: 'Registrati', email: 'Email', password: 'Password', save: 'Salva dati', saving: 'Salvataggio...', personalInfo: 'Informazioni personali',
    personalInfoDesc: 'Questi dati compongono intestazione, link e profilo pubblico.', profileImageUrl: 'URL foto profilo', about: 'Chi sono', publicCv: 'CV pubblico',
    add: 'Aggiungi', edit: 'Modifica', delete: 'Elimina', cancel: 'Annulla', close: 'Chiudi modulo', saveClose: 'Salva e chiudi', saveAddAnother: 'Salva e aggiungi un altro', update: 'Aggiorna elemento',
    hidden: 'Nascosto', hideFromCv: 'Nascondi dal CV', hideDescription: 'Nascondi solo descrizione nel CV', noItems: 'Nessun elemento inserito. Clicca su “Aggiungi” per iniziare.', confirmDelete: 'Vuoi eliminare questo elemento?',
    work: 'Esperienze', education: 'Formazione', languages: 'Lingue', skills: 'Competenze', awards: 'Premi', projects: 'Progetti', caseStudies: 'Case Study',
    skillName: 'Competenza', skillCategory: 'Categoria', rating: 'Valutazione 1-5', newSkillNotice: 'Non presente nel catalogo: puoi aggiungerla come nuova competenza.', catalogHint: 'Cerca prima nel catalogo globale. Se non trovi la skill, puoi inserirla come nuova.',
    views: 'Visualizzazioni profilo', scans: 'Scansioni QR', totalEvents: 'Eventi totali', last30: 'Ultimi 30 giorni', dailyTrend: 'Andamento giornaliero', lastEvents: 'Ultimi eventi', noEvents: 'Nessun evento registrato.',
    radarTitle: 'Radar delle tue competenze', radarDesc: 'Il radar mostra la media per categoria. Sotto trovi dettaglio skill, punteggio utente e suggerimenti intelligenti.', userScore: 'Punteggio utente', suggestedSkills: 'Skill suggerite', suggestedCourses: 'Videocorsi consigliati', skillList: 'Elenco competenze',
    present: 'Presente', from: 'Da', to: 'a', profileNotFound: 'Profilo non trovato o non pubblico.', loading: 'Caricamento...', saved: 'Dati salvati correttamente.'
  },
  en: {
    appName: 'QR Curriculum', dashboard: 'Dashboard', analytics: 'Analytics', radarSkill: 'Skill Radar', publicProfile: 'Public profile', logout: 'Logout', downloadPdf: 'Download PDF',
    homeTitle: 'Your professional profile, always updated, measurable and easy to share.', homeSubtitle: 'Create an online CV with a professional URL, tracked QR code, profile analytics and skill radar.',
    login: 'Login', signup: 'Sign up', email: 'Email', password: 'Password', save: 'Save data', saving: 'Saving...', personalInfo: 'Personal information',
    personalInfoDesc: 'These details build your header, public link and profile.', profileImageUrl: 'Profile photo URL', about: 'About me', publicCv: 'Public CV',
    add: 'Add', edit: 'Edit', delete: 'Delete', cancel: 'Cancel', close: 'Close form', saveClose: 'Save and close', saveAddAnother: 'Save and add another', update: 'Update item',
    hidden: 'Hidden', hideFromCv: 'Hide from CV', hideDescription: 'Hide only description in CV', noItems: 'No items yet. Click “Add” to start.', confirmDelete: 'Do you want to delete this item?',
    work: 'Experience', education: 'Education', languages: 'Languages', skills: 'Skills', awards: 'Awards', projects: 'Projects', caseStudies: 'Case Studies',
    skillName: 'Skill', skillCategory: 'Category', rating: 'Rating 1-5', newSkillNotice: 'Not in the catalog: you can add it as a new skill.', catalogHint: 'Search the global catalog first. If you cannot find the skill, add it as new.',
    views: 'Profile views', scans: 'QR scans', totalEvents: 'Total events', last30: 'Last 30 days', dailyTrend: 'Daily trend', lastEvents: 'Latest events', noEvents: 'No events recorded.',
    radarTitle: 'Your skill radar', radarDesc: 'The radar shows the category average. Below you get skill details, user score and intelligent recommendations.', userScore: 'User score', suggestedSkills: 'Suggested skills', suggestedCourses: 'Recommended video courses', skillList: 'Skill list',
    present: 'Present', from: 'From', to: 'to', profileNotFound: 'Profile not found or not public.', loading: 'Loading...', saved: 'Data saved successfully.'
  }
};

export function getInitialLang() {
  if (typeof window === 'undefined') return 'it';
  return localStorage.getItem('qrcv-lang') || 'it';
}
