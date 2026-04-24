export default function About() {
  return (
    <div className="min-h-screen bg-background py-32">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] mb-6 font-medium text-muted-foreground">Our Story</p>
        <h1 className="text-5xl md:text-7xl font-serif font-light text-primary mb-12">About Rivore</h1>
        <p className="text-lg md:text-xl font-light text-muted-foreground leading-relaxed mb-24 max-w-3xl mx-auto">
          Rivore was born from a passion for exquisite fragrances and a desire to bring luxury to the everyday. We believe that a scent is more than just a fragrance; it's an invisible accessory, a memory trigger, and a statement of individuality.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 text-left border-t border-border pt-24">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-primary mb-6">Our Craft</h2>
            <h3 className="text-3xl font-serif font-light text-foreground mb-6">The Art of Perfumery</h3>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Every Rivore perfume is meticulously crafted using the finest ingredients sourced from around the world. Our master perfumers blend traditional techniques with modern innovation to create scents that are both timeless and contemporary.
            </p>
          </div>
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-primary mb-6">Our Promise</h2>
            <h3 className="text-3xl font-serif font-light text-foreground mb-6">Sustainable Luxury</h3>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              We are committed to quality, sustainability, and cruelty-free practices. When you wear Rivore, you wear a fragrance that not only smells extraordinary but is also created with respect for the environment and all living things.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
