import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePageMeta from '../hooks/usePageMeta';
import PageHero from '../components/PageHero';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiHeart, FiUsers, FiStar, FiZap, FiSun, FiGlobe } = FiIcons;

export default function About() {
  usePageMeta('Our Story', 'Learn the story, mission and values of Upper Room Fellowship in Columbiana, Ohio.');
  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="bg-[#F9F9F7] min-h-screen text-black pt-20">
      {/* Hero */}
      <PageHero kicker={'Who We Are'} title={'Our Story'} subtitle={'Transforming lives that transform communities.'} image="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=2000" />

      {/* Mission & Vision */}
      <div className="py-24 px-6 overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }} className="max-w-[900px] mx-auto text-center">
          <motion.span variants={slideInLeft} className="kicker text-[#8A6309]">Our Mission</motion.span>
          <motion.h2 variants={slideInRight} className="text-4xl md:text-6xl mb-10 leading-tight">Know God.<br/>Share Life.<br/>Serve Others.</motion.h2>
          <motion.div variants={fadeUp} className="text-xl opacity-80 leading-relaxed space-y-6">
            <p>
              For over 50 years, the Upper Room Fellowship has been a community of believers in Columbiana, Ohio, dedicated to following Jesus. We believe that church isn't just a building you go to, but a family you belong to. 
            </p>
            <p>
              Whether you've grown up in church or are just starting to ask questions about faith, there is a place for you here. We are passionate about seeing lives transformed by the gospel and equipping people to make a difference in their homes, workplaces, and city.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Core Values Intro */}
      <div className="py-24 px-6 bg-white border-t border-black/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#CCA866] rounded-full blur-[120px] opacity-[0.03] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }} className="max-w-[900px] mx-auto text-center mb-20 relative z-10">
          <motion.span variants={slideInLeft} className="kicker text-[#8A6309]">What Drives Us</motion.span>
          <motion.h2 variants={slideInRight} className="text-4xl md:text-6xl mb-8">Core Values</motion.h2>
          <motion.p variants={fadeUp} className="text-xl opacity-80 leading-relaxed mb-12 max-w-4xl mx-auto">
            When what's important to God becomes precious to us, transformation happens naturally. These values aren't just aspirational statements but practical pathways to living the abundant life Jesus promised.
          </motion.p>
          
          <motion.div variants={fadeUp} className="bg-[#F9F9F7] p-8 md:p-12 rounded-3xl border border-black/5 text-left mb-16 shadow-sm">
            <h3 className="text-3xl font-bold mb-6">Living from the Inside Out</h3>
            <p className="text-lg opacity-80 leading-relaxed mb-6">
              Values shape who we are at our core—they guide our decisions, relationships, and daily choices. At Upper Room Fellowship, we believe transformation happens when our hearts align with God's heart. 
            </p>
            <p className="text-lg opacity-80 leading-relaxed mb-6">
              As we embrace what matters to God, we begin experiencing the freedom and fullness He designed for us. We don't focus on achieving perfection but welcome God's work changing us from within.
            </p>
            <p className="text-lg opacity-80 leading-relaxed font-bold text-[#8A6309]">
              The beautiful result? We become carriers of His love and light wherever we go.
            </p>
          </motion.div>
        </motion.div>

        <div className="max-w-[1145px] mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {[
              {
                icon: FiHeart,
                title: "Treasuring His Presence",
                desc: "We thrive in a growing relationship with God through daily interaction with Him in worship, prayer, and reading the Word. This brings about a kingdom mindset that allows us to live loved.",
                points: ["Cultivating daily rhythms", "Approaching worship as relationship", "Prioritizing God's presence", "Creating accessible environments"]
              },
              {
                icon: FiUsers,
                title: "Pursuing Healthy Relationships",
                desc: "We thrive through relationships with others as we show up authentically, with kindness and honor. Living this way creates invitational and nurturing communities that love genuinely.",
                points: ["Creating a culture of honor", "Developing listening skills", "Establishing clear boundaries", "Risking vulnerability"]
              },
              {
                icon: FiStar,
                title: "Knowing Our Greatness",
                desc: "We thrive as we serve with God by ministering in our unique and personal way to the world around us with excellence, believing there is no spectator Christianity.",
                points: ["Discovering unique gifts", "Serving from a place of identity", "Pursuing excellence", "Creating pathways to contribute"]
              },
              {
                icon: FiZap,
                title: "Owning A Supernatural Lifestyle",
                desc: "We thrive in risk, faith, miracles, and wonders as we partner with the Holy Spirit, being freed to live a supernatural life instead of living in religious bondage.",
                points: ["Expecting God to work", "Developing spiritual sensitivity", "Praying boldly for healing", "Taking faith-filled risks"]
              },
              {
                icon: FiSun,
                title: "Accessing Abundant Wholeness",
                desc: "We thrive in complete joy and live from abundance because Jesus loved us and paid for everything we need by His work on the cross, opening the way for complete salvation.",
                points: ["Approaching life without lack", "Receiving God's healing", "Embracing wise stewardship", "Living with an inheritance mindset"]
              },
              {
                icon: FiGlobe,
                title: "Living the Gospel",
                desc: "We thrive as we model and share the life of Christ through a life of servanthood and overwhelming generosity, desiring that our communities know the amazing love of Jesus.",
                points: ["Serving others unconditionally", "Giving generously", "Sharing faith naturally", "Advocating for justice"]
              }
            ].map((value, idx) => (
              <motion.div key={idx} variants={fadeUp} className="fcard group relative overflow-hidden">
                <div className="absolute -right-6 -top-6 text-[#CCA866] opacity-10 group-hover:scale-150 group-hover:opacity-20 transition-all duration-700 pointer-events-none">
                  <SafeIcon icon={value.icon} size={150} />
                </div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 bg-[#FFC44F] rounded-full flex items-center justify-center text-black text-2xl shadow-md">
                    <SafeIcon icon={value.icon} />
                  </div>
                  <div className="text-[#CCA866] font-bold text-4xl opacity-50 font-serif">0{idx + 1}</div>
                </div>
                <h3 className="text-3xl font-bold mb-4 relative z-10">{value.title}</h3>
                <p className="opacity-80 mb-8 text-lg relative z-10">{value.desc}</p>
                <div className="relative z-10">
                  <h4 className="font-bold mb-3 uppercase tracking-wider text-sm opacity-60">In practice:</h4>
                  <ul className="space-y-2">
                    {value.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 opacity-80">
                        <span className="text-[#8A6309] mt-1 text-xs">◆</span> {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }} className="max-w-[900px] mx-auto text-center mt-32 relative z-10">
          <motion.h3 variants={slideInLeft} className="text-3xl md:text-5xl font-bold mb-8">Growing in Our Values</motion.h3>
          <motion.p variants={fadeUp} className="text-xl opacity-80 leading-relaxed mb-6">
            These values aren't just words for us. They're the heart of what we believe and how we try to live. Jesus showed us what these values look like in action, and we're doing our best to follow His example.
          </motion.p>
          <motion.p variants={fadeUp} className="text-xl opacity-80 leading-relaxed mb-6">
            Living by these values isn't always easy, but we've found it's incredibly rewarding. There's a real sense of purpose and joy that comes from aligning our lives with what God values.
          </motion.p>
        </motion.div>
      </div>

      <div className="py-32 px-6 text-center bg-[#FFC44F] text-black">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-4xl md:text-6xl mb-8">Come see for yourself.</h2>
          <Link to="/visit" className="btn btn-outline border-black hover:bg-black group">
            Plan Your Visit <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}