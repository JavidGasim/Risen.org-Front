import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Check, X, Zap, Star, Crown, Sparkles,
  Shield, ArrowRight, CreditCard, Lock
} from 'lucide-react';

// ── Plan data ──────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    code: 'Free',
    name: 'Free',
    icon: Shield,
    iconColor: '#9CA3AF',
    accent: 'rgba(156,163,175,0.25)',
    border: 'rgba(156,163,175,0.25)',
    monthlyPrice: 0,
    yearlyPrice: 0,
    badge: null,
    description: 'Start your engineering journey.',
    features: [
      { label: '5 quests per day', included: true },
      { label: 'Basic subjects access', included: true },
      { label: 'Streak tracking', included: true },
      { label: 'Global leaderboard', included: true },
      { label: 'Risen Score', included: false },
      { label: 'Unlimited quests', included: false },
      { label: 'All premium subjects', included: false },
      { label: 'Priority support', included: false },
      { label: 'Lifestyle perks & discounts', included: false },
    ],
    cta: 'Current Plan',
    ctaDisabled: true,
  },
  {
    id: 'premium',
    code: 'Premium',
    name: 'Premium',
    icon: Star,
    iconColor: '#6366F1',
    accent: 'rgba(99,102,241,0.15)',
    border: 'rgba(99,102,241,0.5)',
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    badge: 'Most Popular',
    badgeColor: '#6366F1',
    description: 'Unlock your full potential.',
    features: [
      { label: '5 quests per day', included: true },
      { label: 'Basic subjects access', included: true },
      { label: 'Streak tracking', included: true },
      { label: 'Global leaderboard', included: true },
      { label: 'Risen Score', included: true },
      { label: 'Unlimited quests', included: true },
      { label: 'All premium subjects', included: true },
      { label: 'Priority support', included: true },
      { label: 'Lifestyle perks & discounts', included: false },
    ],
    cta: 'Upgrade to Premium',
    ctaDisabled: false,
  },
  {
    id: 'lifestyle',
    code: 'Lifestyle',
    name: 'Lifestyle',
    icon: Crown,
    iconColor: '#F59E0B',
    accent: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.5)',
    monthlyPrice: 24.99,
    yearlyPrice: 19.99,
    badge: 'Elite',
    badgeColor: '#F59E0B',
    description: 'The complete engineer lifestyle.',
    features: [
      { label: '5 quests per day', included: true },
      { label: 'Basic subjects access', included: true },
      { label: 'Streak tracking', included: true },
      { label: 'Global leaderboard', included: true },
      { label: 'Risen Score', included: true },
      { label: 'Unlimited quests', included: true },
      { label: 'All premium subjects', included: true },
      { label: 'Priority support', included: true },
      { label: 'Lifestyle perks & discounts', included: true },
    ],
    cta: 'Go Lifestyle',
    ctaDisabled: false,
  },
];

// ── Upgrade Modal ──────────────────────────────────────────────────────────────
function UpgradeModal({ plan, billing, onClose, onConfirm, loading }) {
  const price = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  const Icon = plan.icon;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="slide-up"
        style={{
          width: '100%', maxWidth: '460px',
          background: 'linear-gradient(145deg, rgba(20,25,35,0.98), rgba(10,13,20,0.98))',
          border: `1px solid ${plan.border}`,
          borderRadius: '24px', padding: '40px',
          boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 40px ${plan.accent}`,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: plan.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${plan.border}`,
          }}>
            <Icon size={26} color={plan.iconColor} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#F8FAFC' }}>Upgrade to {plan.name}</h2>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem' }}>{plan.description}</p>
          </div>
        </div>

        {/* Price summary */}
        <div style={{
          background: 'rgba(0,0,0,0.3)', borderRadius: '14px',
          padding: '20px 24px', marginBottom: '28px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94A3B8' }}>Plan</span>
            <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{plan.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ color: '#94A3B8' }}>Billing</span>
            <span style={{ color: '#F8FAFC', fontWeight: 600, textTransform: 'capitalize' }}>{billing}</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ color: '#F8FAFC', fontWeight: 700 }}>Total per month</span>
            <span style={{ color: plan.iconColor, fontWeight: 800, fontSize: '1.4rem' }}>
              ${price.toFixed(2)}
            </span>
          </div>
          {billing === 'yearly' && (
            <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: '#10B981', textAlign: 'right' }}>
              🎉 You save ${((plan.monthlyPrice - plan.yearlyPrice) * 12).toFixed(2)}/year
            </p>
          )}
        </div>

        {/* Payment placeholder */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 18px', borderRadius: '12px',
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
          marginBottom: '24px',
        }}>
          <Lock size={16} color="#6366F1" />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>
            Payments processed securely via <strong style={{ color: '#E2E8F0' }}>Stripe</strong>. Cancel anytime.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '14px', borderRadius: '10px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem',
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(plan, billing)}
            disabled={loading}
            style={{
              flex: 2, padding: '14px', borderRadius: '10px',
              background: plan.iconColor === '#F59E0B'
                ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                : plan.iconColor === '#6366F1'
                  ? 'linear-gradient(135deg, #6366F1, #4F46E5)'
                  : '#4B5563',
              border: 'none', color: '#fff', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: `0 0 20px ${plan.accent}`,
            }}
          >
            <CreditCard size={18} />
            {loading ? 'Processing…' : `Pay $${price.toFixed(2)}/mo`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Pricing Page ──────────────────────────────────────────────────────────
export default function Pricing() {
  const { user, stats, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [successPlan, setSuccessPlan] = useState(null);

  const currentPlanCode = stats?.plan || user?.plan || 'Free';

  const handleSelect = (plan) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (plan.ctaDisabled || plan.code === currentPlanCode) return;
    setSelectedPlan(plan);
  };

  const handleConfirm = async (plan, billingCycle) => {
    setUpgradeLoading(true);
    // Simulate Stripe redirect / API call
    await new Promise(r => setTimeout(r, 1800));
    setUpgradeLoading(false);
    setSelectedPlan(null);
    setSuccessPlan(plan);
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '80px' }}>

      {/* ── Hero ── */}
      <div className="slide-up" style={{ textAlign: 'center', padding: '60px 24px 48px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 18px', borderRadius: '999px',
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
          color: '#818CF8', fontSize: '0.85rem', fontWeight: 600,
          marginBottom: '24px', letterSpacing: '0.5px',
        }}>
          <Sparkles size={14} /> Unlock Your Full Potential
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 800, marginBottom: '16px', lineHeight: 1.1 }}>
          Choose Your{' '}
          <span className="text-gradient">Engineering Tier</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto 36px' }}>
          Every plan starts a journey. Upgrade to go further, faster.
        </p>

        {/* Billing Toggle */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0',
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '4px',
        }}>
          {['monthly', 'yearly'].map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                padding: '10px 24px', borderRadius: '9px', border: 'none',
                fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem',
                cursor: 'pointer', transition: 'all 0.25s',
                background: billing === b ? 'rgba(99,102,241,0.9)' : 'transparent',
                color: billing === b ? '#fff' : '#94A3B8',
                boxShadow: billing === b ? '0 0 14px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              {b === 'monthly' ? 'Monthly' : 'Yearly'}
              {b === 'yearly' && (
                <span style={{
                  marginLeft: '8px', fontSize: '0.75rem', fontWeight: 700,
                  background: 'rgba(16,185,129,0.2)', color: '#10B981',
                  padding: '2px 8px', borderRadius: '999px',
                }}>−20%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Plan Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '1100px', margin: '0 auto', padding: '0 24px',
      }}>
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const price = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
          const isCurrent = plan.code === currentPlanCode;
          const isPopular = plan.badge === 'Most Popular';

          return (
            <div
              key={plan.id}
              className="slide-up"
              style={{
                animationDelay: `${i * 100}ms`,
                position: 'relative',
                borderRadius: '24px',
                padding: '36px 32px',
                background: isPopular
                  ? 'linear-gradient(145deg, rgba(30,25,60,0.95), rgba(15,13,40,0.95))'
                  : 'linear-gradient(145deg, rgba(20,25,35,0.9), rgba(10,13,20,0.95))',
                border: `1px solid ${plan.border}`,
                boxShadow: isPopular ? `0 0 40px ${plan.accent}` : 'none',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex', flexDirection: 'column',
                transform: isPopular ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              {/* Top shimmer line */}
              <div style={{
                position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
                background: `linear-gradient(90deg, transparent, ${plan.iconColor}, transparent)`,
                opacity: 0.6, borderRadius: '1px',
              }} />

              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  padding: '5px 18px', borderRadius: '999px',
                  background: plan.badgeColor, color: '#fff',
                  fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.5px',
                  boxShadow: `0 4px 14px ${plan.accent}`,
                  whiteSpace: 'nowrap',
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Icon & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: plan.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${plan.border}`,
                  boxShadow: `0 0 16px ${plan.accent}`,
                }}>
                  <Icon size={24} color={plan.iconColor} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#F8FAFC' }}>{plan.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>{plan.description}</p>
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: '28px' }}>
                {price === 0 ? (
                  <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                    Free
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>$</span>
                    <span style={{
                      fontSize: '3rem', fontWeight: 800, lineHeight: 1,
                      color: plan.iconColor,
                      textShadow: `0 0 20px ${plan.accent}`,
                    }}>
                      {price.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '6px' }}>/mo</span>
                  </div>
                )}
                {billing === 'yearly' && price > 0 && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#10B981' }}>
                    Billed ${(price * 12).toFixed(2)}/year · Save ${((plan.monthlyPrice - price) * 12).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', margin: '0 0 32px', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {plan.features.map((f, fi) => (
                  <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {f.included ? (
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: `rgba(16,185,129,0.15)`, border: '1px solid rgba(16,185,129,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Check size={12} color="#10B981" strokeWidth={3} />
                      </div>
                    ) : (
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <X size={12} color="#4B5563" strokeWidth={3} />
                      </div>
                    )}
                    <span style={{
                      fontSize: '0.92rem',
                      color: f.included ? '#CBD5E1' : '#4B5563',
                      fontWeight: f.included ? 500 : 400,
                    }}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelect(plan)}
                disabled={isCurrent || plan.ctaDisabled}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  border: isCurrent ? `1px solid ${plan.border}` : 'none',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: '1rem',
                  cursor: isCurrent ? 'default' : 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: isCurrent
                    ? 'transparent'
                    : plan.id === 'lifestyle'
                      ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                      : plan.id === 'premium'
                        ? 'linear-gradient(135deg, #6366F1, #4F46E5)'
                        : 'rgba(255,255,255,0.05)',
                  color: isCurrent ? plan.iconColor : '#fff',
                  boxShadow: !isCurrent && plan.id !== 'free'
                    ? `0 0 24px ${plan.accent}`
                    : 'none',
                  opacity: plan.ctaDisabled && !isCurrent ? 0.5 : 1,
                }}
              >
                {isCurrent ? (
                  <>
                    <Check size={18} /> Current Plan
                  </>
                ) : (
                  <>
                    {plan.cta} <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── FAQ / Trust signals ── */}
      <div style={{ maxWidth: '700px', margin: '64px auto 0', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {[
            { icon: Lock, text: 'Secure payments via Stripe' },
            { icon: Zap, text: 'Instant activation' },
            { icon: ArrowRight, text: 'Cancel anytime' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.9rem' }}>
              <Icon size={16} color="#6366F1" /> {text}
            </div>
          ))}
        </div>

        <div className="glass-panel" style={{ padding: '28px 32px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#CBD5E1' }}>Frequently Asked Questions</h3>
          {[
            { q: 'Can I switch plans later?', a: 'Yes. Upgrade or downgrade at any time. Billing adjusts automatically on your next cycle.' },
            { q: 'What are Lifestyle perks?', a: 'Exclusive discounts on engineering tools, certifications, and partner products — curated for the serious engineer.' },
            { q: 'Is my data safe?', a: 'Absolutely. Payments are handled by Stripe. We never store card details.' },
          ].map(({ q, a }, i) => (
            <div key={i} style={{ marginBottom: i < 2 ? '18px' : 0 }}>
              <p style={{ fontWeight: 600, color: '#E2E8F0', marginBottom: '4px', fontSize: '0.95rem' }}>{q}</p>
              <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Success Banner ── */}
      {successPlan && (
        <div
          className="slide-up"
          style={{
            position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))',
            color: '#fff', padding: '18px 32px', borderRadius: '16px',
            display: 'flex', alignItems: 'center', gap: '14px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(16,185,129,0.4)',
            zIndex: 999, maxWidth: '420px', width: '90%',
          }}
        >
          <Check size={22} strokeWidth={3} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>
              🎉 Welcome to {successPlan.name}!
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', opacity: 0.85 }}>
              Your plan has been activated. Enjoy your upgraded access!
            </p>
          </div>
          <button
            onClick={() => setSuccessPlan(null)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7, marginLeft: 'auto', flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ── Upgrade Modal ── */}
      {selectedPlan && (
        <UpgradeModal
          plan={selectedPlan}
          billing={billing}
          onClose={() => setSelectedPlan(null)}
          onConfirm={handleConfirm}
          loading={upgradeLoading}
        />
      )}
    </div>
  );
}
