import { motion } from 'framer-motion';

export default function ProSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <motion.div
        className="max-w-3xl mx-auto text-center glass-card-elevated p-12 sm:p-16 rounded-3xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-6 tracking-wide uppercase">
          Coming Soon
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          HandScript Pro
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          Unlock custom handwriting training, multi-page documents, batch processing, and API access.
        </p>
        <button className="btn-premium">Join the Waitlist</button>
      </motion.div>
    </section>
  );
}
