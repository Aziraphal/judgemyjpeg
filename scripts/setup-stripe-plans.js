/**
 * Script pour créer les nouveaux plans de paiement dans Stripe
 * Remplace le plan Lifetime par un plan Annuel
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupStripePlans() {
  try {
    console.log('🔄 Configuration des nouveaux plans Stripe...\n');

    // 1. Créer le produit JudgeMyJPEG si n'existe pas
    let product;
    
    try {
      const products = await stripe.products.list({ limit: 10 });
      product = products.data.find(p => p.name === 'JudgeMyJPEG Premium');
      
      if (!product) {
        product = await stripe.products.create({
          name: 'JudgeMyJPEG Premium',
          description: 'Analyses photo IA illimitées + fonctionnalités premium',
          metadata: {
            service: 'judgemyjpeg',
            version: '2025'
          }
        });
        console.log('✅ Produit créé:', product.id);
      } else {
        console.log('ℹ️  Produit existant:', product.id);
      }
    } catch (error) {
      console.error('❌ Erreur création produit:', error.message);
      return;
    }

    // 2. Créer le prix Starter Pack €4.99 (one-shot)
    let starterPrice;
    
    try {
      starterPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 499, // €4.99 en centimes
        currency: 'eur',
        // PAS de recurring = paiement one-shot
        metadata: {
          plan_type: 'starter',
          features: '10_analysis,3_shares,3_exports,all_modes',
          description: 'One-shot purchase for testing'
        }
      });
      console.log('✅ Prix Starter Pack créé:', starterPrice.id, '- €4.99 (one-shot)');
    } catch (error) {
      console.error('❌ Erreur prix starter:', error.message);
    }

    // 3. Créer le prix mensuel €9.98/mois
    let monthlyPrice;
    
    try {
      monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 998, // €9.98 en centimes
        currency: 'eur',
        recurring: {
          interval: 'month',
          interval_count: 1
        },
        metadata: {
          plan_type: 'monthly',
          features: 'unlimited_analysis,collections,export_pdf'
        }
      });
      console.log('✅ Prix mensuel créé:', monthlyPrice.id, '- €9.98/mois');
    } catch (error) {
      console.error('❌ Erreur prix mensuel:', error.message);
    }

    // 4. Créer le prix annuel €79/an (économie de ~€40/an)
    let annualPrice;
    
    try {
      annualPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 7900, // €79 en centimes
        currency: 'eur',
        recurring: {
          interval: 'year',
          interval_count: 1
        },
        metadata: {
          plan_type: 'annual',
          features: 'unlimited_analysis,collections,export_pdf',
          savings: '40_euros_per_year'
        }
      });
      console.log('✅ Prix annuel créé:', annualPrice.id, '- €79/an');
    } catch (error) {
      console.error('❌ Erreur prix annuel:', error.message);
    }

    // 5. Afficher les IDs à configurer
    console.log('\n📋 CONFIGURATION REQUISE:');
    console.log('Ajoutez ces variables dans votre .env.local:\n');
    
    if (starterPrice) {
      console.log(`STRIPE_STARTER_PRICE_ID=${starterPrice.id}`);
    }
    
    if (monthlyPrice) {
      console.log(`STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    }
    
    if (annualPrice) {
      console.log(`STRIPE_ANNUAL_PRICE_ID=${annualPrice.id}`);
    }
    
    console.log('\n🎯 ÉTAPES SUIVANTES:');
    console.log('1. Copiez les IDs ci-dessus dans .env.local');
    console.log('2. Redémarrez l\'application');
    console.log('3. Testez les nouveaux plans sur /pricing');
    console.log('4. Configurez les webhooks si nécessaire');
    
    // 5. Lister les anciens prix à désactiver
    console.log('\n⚠️  NETTOYAGE (optionnel):');
    const allPrices = await stripe.prices.list({ product: product.id, limit: 20 });
    const oldPrices = allPrices.data.filter(p => 
      p.id !== monthlyPrice?.id && 
      p.id !== annualPrice?.id &&
      p.active
    );
    
    if (oldPrices.length > 0) {
      console.log('Anciens prix à désactiver:');
      oldPrices.forEach(price => {
        const amount = price.unit_amount / 100;
        const interval = price.recurring?.interval || 'one-time';
        console.log(`- ${price.id} (€${amount} ${interval})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le script
setupStripePlans();