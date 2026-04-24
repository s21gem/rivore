import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCcw, Clock, Droplet, Video, Truck, Mail } from 'lucide-react';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.3em] font-medium text-muted-foreground mb-4"
          >
            Commitment to Excellence
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-light text-foreground"
          >
            Return & Refund Policy
          </motion.h1>
        </div>

        {/* The Rivore Promise */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 text-primary mb-6">
            <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-light text-foreground mb-6">The Rivore Promise</h2>
          <p className="text-lg font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We craft every fragrance with uncompromising dedication to quality and elegance. 
            If your experience falls short of extraordinary, we are committed to making it right. 
            Your trust is our most valued asset.
          </p>
        </motion.section>

        {/* Easy Resolutions */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24 bg-muted/30 p-10 md:p-16 rounded-2xl text-center border border-border"
        >
          <RefreshCcw className="w-8 h-8 stroke-[1.5] text-accent mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-light text-foreground mb-4">Easy Resolutions</h2>
          <p className="text-base font-light text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
            Initiating a return or reporting an issue is seamless. Reach out to our concierge team, 
            and we will guide you through a swift and hassle-free resolution process.
          </p>
          <a 
            href="mailto:support@rivore.com" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-primary/90 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </motion.section>

        {/* Rules Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-center text-muted-foreground mb-12">
            Return Guidelines
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rule 1 */}
            <div className="p-8 border border-border bg-white hover:border-accent/50 transition-colors group">
              <Clock className="w-6 h-6 stroke-[1.5] text-accent mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-serif text-foreground mb-3">3-Day Window</h3>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                All return or exchange requests must be initiated within 3 days of receiving your order. 
                Prompt reporting ensures we can assist you effectively.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="p-8 border border-border bg-white hover:border-accent/50 transition-colors group">
              <Droplet className="w-6 h-6 stroke-[1.5] text-accent mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-serif text-foreground mb-3">90% Volume Requirement</h3>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                To qualify for a return, the fragrance must retain at least 90% of its original volume. 
                This allows you to test the scent while maintaining product integrity.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="p-8 border border-border bg-white hover:border-accent/50 transition-colors group">
              <Video className="w-6 h-6 stroke-[1.5] text-accent mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-serif text-foreground mb-3">Unboxing Video Mandatory</h3>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                For any claims regarding damaged, leaked, or missing items, a clear, continuous, and unedited 
                unboxing video is strictly required to process your request.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="p-8 border border-border bg-white hover:border-accent/50 transition-colors group">
              <Truck className="w-6 h-6 stroke-[1.5] text-accent mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-serif text-foreground mb-3">Delivery Charges</h3>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                Original delivery charges are non-refundable. Return shipping costs are the responsibility 
                of the customer unless the return is due to an error on our part.
              </p>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
