import React, { Component } from 'react'
import './Pages.css'
import './About.css'
import { Link } from 'react-router-dom'
import BlueButton from '../BlueButton'

export default class About extends Component {
	render() {
		return (
			<section className="page" id="about">
				<h1>À propos</h1>
				<p>
					<a href="https://beta.gouv.fr" target="_blank">
						L'incubateur des services numériques de l'État
					</a>{' '}
					a lancé en 2014 le développement d’une <em>ressource ouverte</em> de
					calcul des prélèvements sociaux sur les revenus d'activité en France.
				</p>
				<p>
					Ce premier service, un{' '}
					<em>module de simulation des sommes en jeu lors d'une embauche</em>,
					peut être{' '}
					<Link to="/intégrer">intégré facilement et gratuitement</Link> par
					toute organisation sur son site Web.
				</p>
				<p>
					Ce travail est contributif : venez définir avec nous la feuille de
					route du service (implémentation des conventions collectives, ajout
					des statuts autres que le travail salarié, ...).
				</p>
				<MailChimp />
				<p>
					Ou <Link to="/contact">contactez-nous</Link> directement.
				</p>
				{/* <p>Notre prochaine rencontre OpenLab aura lieu <strong>le mercredi 18 janvier 2017 à 10h</strong>, au 86 allée de Bercy, 75012, salle 381-R</p> */}
				<h1>Vie privée</h1>
				<p>
					Les simulateurs hébergés sur embauche.beta.gouv.fr n'ont pas de
					mémoire : les données de simulation (salaires, code postal de
					l'entreprise, etc.) <em>ne sont pas stockées sur nos serveurs</em>.
				</p>
				<p>
					Par contre, nous recueillons des statistiques anonymes d'usage du
					site, que nous utilisons dans l'unique but d'améliorer le service,
					conformément au{' '}
					<a
						href="https://www.cnil.fr/fr/solutions-pour-les-cookies-de-mesure-daudience"
						target="_blank"
					>
						recommandations de la CNIL
					</a>.
				</p>
				<iframe src="http://stats.data.gouv.fr/index.php?module=CoreAdminHome&action=optOut&language=fr" />
			</section>
		)
	}
}

import './MailChimp.css'

let MailChimp = () => (
	<div id="mc_embed_signup">
		<form
			action="https://gouv.us13.list-manage.com/subscribe/post?u=732a4d1b0d2e8a1a1fd3d01db&amp;id=53bed2b6ac"
			method="post"
			id="mc-embedded-subscribe-form"
			name="mc-embedded-subscribe-form"
			className="validate"
			target="_blank"
			noValidate
		>
			<div id="mc_embed_signup_scroll">
				<label htmlFor="mce-EMAIL">
					Inscrivez-vous à notre liste de diffusion
				</label>
				<div
					style={{ position: 'absolute', left: '-5000px', ariaHidden: 'true' }}
				>
					<input
						type="text"
						name="b_732a4d1b0d2e8a1a1fd3d01db_53bed2b6ac"
						tabIndex="-1"
						value=""
					/>
				</div>
				<div className="clear">
					<BlueButton>
						<input
							type="submit"
							value="M'inscrire"
							name="subscribe"
							id="mc-embedded-subscribe"
						/>
					</BlueButton>
				</div>
			</div>
		</form>
	</div>
)
