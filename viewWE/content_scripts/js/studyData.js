//No longer used. These were manually selected articles for each topic using FLAIR.

export default class StudyData {
    static getPossibleArticles(topic){
    switch(topic){
        case "articles":
          return {
              l1:['body-image-election-1', 'boaty-mcboatface-1', 'border-kids-1', 'botany-students-1', 'boxing-rousey-1', 'boyscouts-gayleaders-1', 'brady-deflategate-1', 'blue-leaves-1', 'bones-art-1', 'bogota-art-1'],
              l2:['hoverboards-safety-2', 'how-to-fix-american-policing-2', 'hsgrad-rates-2', 'hula-flowerfungus-2', 'hungarian-shopping-2', 'hurricane-ice-2', 'ice-princess-2', 'house-cliff-2', 'hottest-chili-2'],
              l3:['butterfly-genes-3', 'cambodia-hidden-city-3', 'canada-aboriginals-3', 'canine-cancer-3', 'capeivy-gallfly-3', 'cat-apathy-3', 'cellphones-in-school-3', 'cell-printing-3', 'cheating-tech-3', 'chernobyl-nuclearplant-3'],
              l4:['france-suburbs-4', 'free-lunch-4', 'fosterkids-mentors-4', 'foreignstudents-book-4', 'france-rats-4', 'futsal-la-4', 'gaga-ball-4', 'gator-hunt-4', 'gambling-procon-4', 'gadgets-pollution-4'],
              l5:['kohler-toilets-5', 'korean-language-5', 'laboratory-noses-5', 'LA-fossils-5', 'la-ipads-5', 'linguistics-huh-5', 'little-libraries-5', 'lobster-trade-5', 'lunch-cheese-sandwich-5', 'malala-nigeria-5', 'moveto-mars-5']
          };
          break;
        case "simplePast":
          return {
              l1:['china-heat-1', 'china-moon-1', 'china-parkour-1', 'china-pollution-1', 'climate-mummies-1', 'civilrights-music-1', 'classicalmusic-students-1', 'cleveland-lebron-1', 'class-sizes-1', 'civil-war-voting-1'],
              l2:['inauguration-dilemma-2', 'india-coffee-2', 'indian-earcleaner-2', 'india-nodoors-2', 'iraq-books-2', 'iran-pokemon-go-2', 'inuit-food-2', 'invasive-lionfish-2', 'japan-mascots-2', 'jayz-tidal-2'],
              l3:['chile-quake-3', 'chimp-testing-3', 'chongqing-wwii-3', 'city-farm-3', 'civilwar-blacksoldiers-3', 'club-sports-3', 'code-breaker-3', 'cockroach-milk-3', 'colombia-horses-3', 'combat-women-3'],
              l4:['giraffe-silent-extinction-4', 'girls-acl-4', 'girls-code-4', 'gettysburg-retraction-4', 'germany-art-4', 'gmo-salmon-4', 'google-balloons-4', 'haiti-teacher-4', 'hamilton-caribbean-4', 'hackable-barbie-4'],
              l5:['mtbaldy-geology-5', 'mural-ban-5', 'museums-selfies-5', 'musical-diplomacy-5', 'music-prodigy-5', 'nasa-moonshot-5', 'nascar-schools-5', 'navy-drone-5', 'northkorea-statues-5', 'nobel-physics-5']
          };
          break;
        case "gerunds":
          return {
              l1:['artist-housing-1', 'asteroid-corral-1', 'asian-immigration-1', 'art-refugees-1', 'ash-borers-1', 'asia-ozone-1', 'avoid-bee-attacks-1', 'arizona-immigration-1', 'army-food-1', 'astronaut-twins-1'],
              l2:['girls-summer-coding-camps-2', 'guerrilla-farming-2', 'grizzly-bear-ca-reintroduction-2', 'halloween-sales-2', 'happy-iran-2', 'haiti-teacher-2', 'harry-potter-science-2', 'grades-homework-2', 'gravity-physics-2', 'harsh-parents-2'],
              l3:['black-thursday-3', 'border-debate-3', 'braingames-adhd-3', 'brain-learning-3', 'brothers-keeper-3', 'books-minecraft-3', 'bones-art-3'],
              l4:['english-laws-4', 'everest-oxygen-4', 'epitaph-for-cursive-4', 'family-baking-business-4', 'family-camping-4', 'family-detention-4', 'exercise-brainbenefits-4', 'fake-news-money-4'],
              l5:['how-to-fix-american-policing-5', 'india-tb-5', 'hottest-chili-5', 'immigration-crisis-5', 'hunting-drones-5', 'instagram-generation-5', 'india-gold-5', 'immigration-primer-5', 'innovation-discontents-5', 'india-cheating-5']
          };
          break;
        case "simPresPresProg":
          return {
              l1:['artist-housing-1', 'asian-immigration-1', 'autonomouscars-cities-1', 'asia-ozone-1', 'astronaut-twins-1', 'asiatic-cheetahs-iran-1', 'automobile-future-1', 'ash-borers-1'],
              l2:['happier-meal-mcdonalds-2', 'grizzly-bear-ca-reintroduction-2', 'girls-summer-coding-camps-2', 'globalwarming-entangledwhales-2', 'guatemala-textile-2', 'guerrilla-farming-2', 'hamilton-caribbean-2', 'graffiti-park-2', 'grandcanyon-development-2', 'grizzlies-polarbears-2'],
              l3:['bratzdolls-comeback-3', 'border-kids-3', 'bodycamera-price-3', 'boy-drone-champion-3', 'braincontrolled-drone-3', 'borderchildren-procon-3', 'botany-students-3', 'brazil-protests-3', 'blackteachers-rolemodels-3', 'blob-warmwater-3'],
              l4:['farms-data-4', 'expanding-universe-math-4', 'farm-climatechange-4', 'english-laws-4', 'esports-popular-4', 'farming-drones-4', 'Fastfood-millennials-4', 'endangered-vaquita-4', 'energydrinks-congress-4'],
              l5:['immigration-crisis-5', 'hungry-planet-fish-farms-5', 'ice-experts-antarctica-5', 'immigration-harvest-5', 'hoverboards-safety-5', 'icebucket-phenomenon-5', 'immigration-protest-5', 'immigrant-education-5', 'india-gold-5', 'huckabee-presannounce-5']
          };
          break;
        case "simPastPastProg":
          return {
              l1:['atomettes-reunion-1', 'ash-borers-1', 'autism-flying-1', 'atlanta-teachers-1'],
              l2:['goldendoodle-supreme-court-2', 'harrypotter-park-2', 'girl-toys-2', 'glaciar-remains-2', 'groundwater-earthquakes-2', 'haitian-migrants-2', 'haiti-teacher-2', 'hayden-librariancongress-2'],
              l3:['bollywood-high-3', 'black-hole-3', 'brussels-attacks-3', 'blind-echolocation-3', 'bokoharam-video-3', 'books-minecraft-3', 'boredom-research-3', 'bostonmarathon-artist-3', 'brazil-obama-3', 'black-women-nasa-history-3'],
              l4:['excessive-celebration-4', 'f22-fighter-4', 'family-baking-business-4', 'energydrinks-congress-4', 'exotic-pets-4', 'fake-news-ramifications-4', 'farm-climatechange-4', 'farm-photographer-4', 'farmworkers-mexico-4', 'ferguson-citycouncil-4'],
              l5:['hurricane-matthew-haiti-5', 'india-tb-5', 'hurricane-matthew-monitors-5', 'immigrant-education-5', 'immigration-protest-5', 'india-floods-5', 'house-cliff-5', 'india-cinemas-national-anthem-5', 'india-coffee-5']
          };
          break;
        case "allSimpleVerbs":
          return {
              l1:['astronaut-twins-1', 'asteroid-crowdsource-1', 'artist-housing-1', 'asteroid-chase-five-years-1', 'autonomouscars-cities-1', 'AsianAmericans-south-1'],
              l2:['hawaii-homeless-2', 'google-selfcars-2', 'hand-transplant-2', 'halloween-sales-2', 'guinea-ebolafree-2', 'hawaii-coral-2', 'hawaii-mountain-2', 'global-warming-experiment-2', 'gmo-salmon-2'],
              l3:['black-thursday-3', 'braille-reading-finalist-3', 'brexit-vote-leave-3', 'britain-currency-3', 'Braille-startup-3', 'breakthrough-starshot-3', 'blackwomen-caucus-3', 'black-women-nasa-history-3', 'blind-driverless-car-3', 'blind-speller-3'],
              l4:['Fastfood-calories-4', 'extinct-aurochs-4', 'everest-litterbugs-4', 'falcons-patriots-superbowl-4', 'farms-data-4', 'esports-popular-4', 'europe-mars-landing-4', 'everest-sherpas-4', 'farm-climatechange-4'],
              l5:['Hurricane-drones-5', 'indian-happiness-institute-5', 'ice-experts-antarctica-5', 'immigration-executive-order-5', 'hscivics-procon-5', 'ice-timecapsule-5', 'immigration-protest-5', 'innovation-discontents-5', 'horses-roundup-5', 'hula-flowerfungus-5']
          };
          break;
        case "willWouldHaveHad":
          return {
              l1:['music-streaming-1', 'christie-surgery-1', 'frog-tongues-1', 'mexico-soda-1', 'trump-school-lunch-1', 'trex-discovery-1', 'obama-monuments-civil-rights-1', 'digital-pianos-1', 'cow-tax-climatechange-1', 'rip-torrents-1'],
              l2:['iran-dogsanctuary-2', 'crabs-toxic-2', 'bionic-leg-2', 'brexit-vote-leave-2', 'vr-shopping-2', 'amazon-drones-2', 'zimmerman-holder-2', 'yurok-drugcourt-2', 'amish-farming-asthma-2', 'drought-jobs-2'],
              l3:['slopestyle-risks-3', 'dog-gaze-3', 'sugary-drink-research-3', 'obama-syria-3', 'starbucks-italy-3', 'la-minwage-3', 'Braille-startup-3', 'student-testing-3', 'snowden-search-3'],
              l4:['buffett-marchmadness-4', 'endangered-bumblebee-4', 'alaska-mine-4', 'alaska-mine-4', 'space-travel-4', 'syria-school-attack-4', 'highschool-seniordefense-4', '3d-print-hand-violin-4', 'olympic-bobsled-4'],
              l5:['ice-experts-antarctica-5', 'dog-meat-protests-5', 'solar-panels-5', 'virtual-surgery-5', 'jupiter-earth-5', 'procon-wages-5', 'trump-immigration-5', 'gambling-procon-5', 'surveillancelaw-expired-5', 'mars-spacemates-5']
          };
          break;
        case "whoWhich":
          return {
              l1:['taiwan-overseasvoters-1', 'mindcontrolled-prosthetic-1', 'autistic-brains-1', 'deported-bedtimestories-1', 'students-fake-news-1', 'air-pollution-true-cost-1', 'senators-hometowns-1', 'harleys-thefts-1', 'iraq-ballet-1', 'brain-creativity-1'],
              l2:['wtc-elevator-2', 'carter-cancer-2', 'journey-to-jupiter-2', 'westcoast-warming-2', 'deathvalley-rocks-2', 'swift-flying-record-2', 'spain-bullfighting-2', 'television-weatherchannel-2', 'motherteresa-sainthood-2'],
              l3:['3D-limbs-3', 'southafrica-immigration-3', 'education-secretary-3', 'eggs-organic-3', 'dolphins-swimming-3', 'republicangovernors-refugees-3', 'wars-procon-3', 'earth-next-door-3', 'space-brain-3', 'juniperoserra-sainthood-3'],
              l4:['generation-k-4', 'currency-women-4', 'bio-politicians-tim-kaine-4', 'space-travel-4', 'india-rupee-4', 'dracula-castle-4', 'animal-trophies-exported-4', 'sikh-islamsolidarity-4', 'aviation-tooling-4', 'weapons-georgiaschools-4'],
              l5:['island-fox-comeback-5', 'solar-panels-5', 'frog-extinction-5', 'walmart-guns-5', 'anxiety-teens-5', 'jayz-tidal-5', 'plastic-turtles-5', 'abercrombie-headscarves-5', 'bergdahl-release-5', 'Teddyroosevelt-library-5', 'kerry-hiroshima-5', 'mars-tsunami-5']
          };
          break;
        case "plusqVsPerf":
          return {
              l1:['arizona-immigration-1', 'auschwitz-guard-trial-1', 'atari-dig-1', 'ash-borers-1', 'atlanta-teachers-1', 'arts-education-1', 'artifacts-tour-1', 'artist-housing-1'],
              l2:['glaciar-remains-2', 'haitian-migrants-2', 'harleys-thefts-2', 'hashtag-staymadabby-2', 'hatchimals-lawsuit-2'],
              l3:['book-banned-3', 'bollywood-high-3', 'brazil-obama-3', 'boxing-rousey-3', 'buddha-shrine-3', 'blackreporter-whitehouse-3', 'boeing-crash-3', 'boredom-research-3', 'boston-marathon-3', 'brady-deflategate-3'],
              l4:['family-camping-4', 'fake-leonardo-4', 'everest-sherpas-4', 'facebook-google-fake-news-4', 'fbi-drones-4', 'europemigrant-minors-4', 'exxonvaldez-anniversary-4', 'females-hunting-4', 'ferguson-coloring-book-4', 'energy-eagles-4'],
              l5:['immigrant-border-5', 'hurricane-patricia-5', 'immigration-senate-5', 'how-to-fix-american-policing-5', 'hurricane-matthew-haiti-5', 'immigration-protection-scotus-5', 'india-tb-5', 'india-watercrisis-5', 'immigrantmothers-bookclub-5', 'immigrant-release-5']
          };
          break;
        case "passiveVsActiveInPast":
          return {
              l1:['atari-dig-1', 'artifacts-tour-1', 'asian-art-1', 'asiana-safety-1', 'asia-ozone-1', 'autism-babies-1', 'autism-ipads-1', 'atlanta-teachers-1', 'arizona-immigration-1'],
              l2:['harleys-thefts-2', 'greatlakes-chemicals-2', 'hate-symbols-2', 'gitmo-101-2', 'gorilla-child-2', 'graffiti-park-2', 'greece-parthenonmarbles-2', 'groundwater-earthcrust-2', 'headdress-twitter-2', 'government-shutdown-2'],
              l3:['borderchildren-procon-3', 'buddha-shrine-3', 'brussels-attackswhy-3', 'brady-deflategate-3', 'breakthrough-starshot-3', 'bogota-art-3', 'boston-marathon-3', 'boston-timecapsule-3'],
              l4:['favela-olympics-4', 'exoticpets-laws-4', 'family-detention-4', 'female-pilot-arlington-4', 'europe-ac-4', 'f22-fighter-4', 'ferguson-citycouncil-4', 'energy-eagles-4', 'europe-mars-landing-4', 'exporting-chihuahuas-4'],
              l5:['immigrantoverload-schools-5', 'india-cinemas-national-anthem-5', 'implicit-bias-preschool-5', 'human-plague-US-5', 'hydrogen-diamond-5', 'human-right-speak-languages-5', 'india-floods-5', 'india-tb-5']
          };
          break;
        case "adjCompSuperl":
          return {
              l1:['atari-dig-1', 'aztec-discovery-1', 'aviation-tooling-1', 'asteroid-corral-1', 'art-refugees-1', 'avalanche-education-1', 'athletes-mentalhealth-1', 'avalanche-control-big-guns-1', 'Australia-troubledkids-1', 'autonomous-cars-access-1'],
              l2:['gop-debate-2', 'hayden-librariancongress-2', 'goldfish-suit-2', 'girls-summer-coding-camps-2', 'gitmo-101-2', 'greatlakes-chemicals-2', 'halloween-sales-2', 'greenland-shark-oldest-vertebrate-2', 'greek-ruins-bacteria-2'],
              l3:['brain-creativity-3', 'britain-palace-3', 'breakthrough-starshot-3', 'boehner-resignation-3', 'boy-drone-champion-3', 'brianwilliams-suspend-3', 'blind-swimmer-3', 'black-thursday-3'],
              l4:['fake-news-ramifications-4', 'everest-oxygen-4', 'family-camping-4', 'englishlanguage-lying-4', 'europe-ac-4', 'evolution-animalsbigger-4', 'faster-baseball-4', 'endangered-vaquita-4', 'expanding-universe-math-4', 'falcons-patriots-superbowl-4'],
              l5:['indigenous-people-environment-5', 'india-cheating-5', 'india-tb-5', 'how-to-fix-american-policing-5', 'immigrantmothers-bookclub-5', 'hungry-planet-fish-farms-5', 'horticulture-crisis-5', 'hurricane-tornado-5', 'implicit-bias-preschool-5', 'hurricane-matthew-monitors-5']
          };
          break;
        case "prepositions":
          return {
              l1:['degas-art-mystery-1', 'dental-dna-1', 'danceboy-adhd-1', 'dali-warhol-1', 'dakota-oilboom-1', 'dairyfarm-abuse-1', 'dc-statehood-1', 'deaf-speller-1', 'derby-dolls-1', 'disney-airspace-1'],
              l2:['latam-moocs-2', 'late-medal-2', 'latinos-katrina', 'lebanon-hiphop', 'lebron-activism', 'looted-art-2', 'manatee-florida-2', 'mariachi-kids-2', 'memory-competition-2', 'military-bases-2'],
              l3:['dark-matter-3', 'deaf-bizowners-3', 'dental-dna-3', 'eco-car-3', 'ebola-soccer-3', 'electric-eels-3', 'elfaro-shipwreck-3', 'elk-cranberries-3', 'englishlanguage-lying-3', 'fake-leonardo-3'],
              l4:['japan-pow-4', 'jellyfish-robot-4', 'jordan-refugeecity-4', 'july-hottest-month-4', 'joecrow-obit-4', 'keystone-oilpipeline-4', 'kids-suing-state-4', 'michelle-guns-4', 'mexico-tv-4', 'mideast-foodculture-4'],
              l5:['norway-sun-5', 'nyfw-nepal-5', 'obama-cooking-5', 'nutria-laststand-5', 'owl-war-5', 'pakistani-pigeons-5', 'paintball-game-5', 'panda-births-5', 'peru-save-languages-5', 'physics-monet-5']
          };
          break;
        case "simPastPresPerfPastProg":
          return {
              l1:['atomettes-reunion-1', 'ash-borers-1', 'art-refugees-1', 'atlanta-teachers-1'],
              l2:['goldendoodle-supreme-court-2', 'harrypotter-park-2', 'girl-toys-2', 'glaciar-remains-2', 'groundwater-earthquakes-2', 'haitian-migrants-2', 'haiti-teacher-2', 'hayden-librariancongress-2'],
              l3:['bollywood-high-3', 'black-hole-3', 'brussels-attacks-3', 'blind-echolocation-3', 'bokoharam-video-3', 'books-minecraft-3', 'boredom-research-3', 'bostonmarathon-artist-3', 'brazil-obama-3', 'black-women-nasa-history-3'],
              l4:['excessive-celebration-4', 'f22-fighter-4', 'family-baking-business-4', 'energydrinks-congress-4', 'exotic-pets-4', 'fake-news-ramifications-4', 'farm-climatechange-4', 'farm-photographer-4', 'farmworkers-mexico-4', 'ferguson-citycouncil-4'],
              l5:['hurricane-matthew-haiti-5', 'india-tb-5', 'hurricane-matthew-monitors-5', 'immigrant-education-5', 'immigration-protest-5', 'india-floods-5', 'house-cliff-5', 'india-cinemas-national-anthem-5', 'india-coffee-5']
          };
          break;
    }
    };
}