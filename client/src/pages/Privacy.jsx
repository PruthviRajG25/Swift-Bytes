import { CANTEEN } from '../config/canteen';

const Privacy = () => {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-dark">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">
        This Privacy Policy explains how {CANTEEN.name} (“we”, “our”) collects and uses data in
        SwiftBites Bites.
      </p>

      <section className="mt-8 space-y-3 text-sm text-neutral-700">
        <h2 className="text-base font-bold text-dark">What we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Account info: name, email, and login details.</li>
          <li>Order info: items, total, token number, payment method, and optional instructions.</li>
          <li>Usage data: basic app events to help improve reliability.</li>
        </ul>
      </section>

      <section className="mt-6 space-y-3 text-sm text-neutral-700">
        <h2 className="text-base font-bold text-dark">How we use data</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>To process orders and show live order status updates.</li>
          <li>To provide invoices and daily earnings summaries for the canteen.</li>
          <li>To prevent abuse and improve the service experience.</li>
        </ul>
      </section>

      <section className="mt-6 space-y-3 text-sm text-neutral-700">
        <h2 className="text-base font-bold text-dark">Sharing</h2>
        <p>
          We do not sell your personal data. Order details are visible to canteen admins for
          fulfilling orders. Payment verification (Cash/UPI) is handled by the canteen staff.
        </p>
      </section>

      <section className="mt-6 space-y-3 text-sm text-neutral-700">
        <h2 className="text-base font-bold text-dark">Retention</h2>
        <p>
          We retain order records for operational and accounting purposes. You can request deletion
          of your account data through the canteen administration.
        </p>
      </section>

      <section className="mt-6 space-y-3 text-sm text-neutral-700">
        <h2 className="text-base font-bold text-dark">Contact</h2>
        <p>
          For privacy questions, contact the canteen admin desk at {CANTEEN.name}.
        </p>
      </section>

      <p className="mt-10 text-xs text-neutral-400">
        Last updated: {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
      </p>
    </main>
  );
};

export default Privacy;
