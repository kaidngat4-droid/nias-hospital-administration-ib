/* ============================================================
   NIAS IBB - Hospital Management Brochure JS v2026 Final
   المعهد الوطني للعلوم الإدارية - فرع إب
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== Preloader ====================
    setTimeout(function() {
        var preloader = document.getElementById('preloader');
        if (preloader) preloader.classList.add('hidden');
    }, 800);

    // ==================== Scroll to Top ====================
    var scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 600) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        });
        scrollBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==================== Scroll Down Button ====================
    var scrollDownBtn = document.querySelector('.scroll-down');
    if (scrollDownBtn) {
        scrollDownBtn.addEventListener('click', function() {
            var aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // ==================== Side Navigation ====================
    var menuToggleBtn = document.getElementById('menuToggleBtn');
    var sideNav = document.getElementById('sideNav');
    var sideNavClose = document.getElementById('sideNavClose');
    var sideNavOverlay = document.getElementById('sideNavOverlay');
    var sideNavLinks = document.querySelectorAll('.side-nav-links a');
    
    function openSideNav() {
        if (sideNav) sideNav.classList.add('open');
        if (sideNavOverlay) sideNavOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'true');
    }
    
    function closeSideNav() {
        if (sideNav) sideNav.classList.remove('open');
        if (sideNavOverlay) sideNavOverlay.classList.remove('active');
        document.body.style.overflow = '';
        if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'false');
    }
    
    if (menuToggleBtn) menuToggleBtn.addEventListener('click', openSideNav);
    if (sideNavClose) sideNavClose.addEventListener('click', closeSideNav);
    if (sideNavOverlay) sideNavOverlay.addEventListener('click', closeSideNav);
    
    sideNavLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            closeSideNav();
        });
    });

    // ==================== Countdown Timer ====================
    function startCountdown() {
        var targetDate = new Date(2026, 7, 1, 0, 0, 0).getTime();
        var countdownEl = document.getElementById('countdown');
        
        function updateCountdown() {
            var now = new Date().getTime();
            var distance = targetDate - now;
            
            if (distance < 0) {
                if (countdownEl) {
                    countdownEl.innerHTML = '<div class="countdown-ended">📢 لقد انتهت فترة التسجيل للعام الدراسي 2026-2027</div>';
                }
                return;
            }
            
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            var daysEl = document.getElementById('cd-days');
            var hoursEl = document.getElementById('cd-hours');
            var minsEl = document.getElementById('cd-minutes');
            var secsEl = document.getElementById('cd-seconds');
            
            if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minsEl) minsEl.textContent = minutes.toString().padStart(2, '0');
            if (secsEl) secsEl.textContent = seconds.toString().padStart(2, '0');
        }
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    startCountdown();

    // ==================== Stats Counter ====================
    var statObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var stat = entry.target;
                var target = parseInt(stat.getAttribute('data-target'));
                var duration = 2000;
                var start = 0;
                var increment = target / (duration / 16);
                var timer = setInterval(function() {
                    start += increment;
                    if (start >= target) {
                        stat.textContent = target;
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(start);
                    }
                }, 16);
                statObserver.unobserve(stat);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.stat-number[data-target]').forEach(function(s) {
        statObserver.observe(s);
    });

    // ==================== Graduates Slider - FIXED ====================
    var gradCurrent = 0;
    var gradTrack = document.getElementById('graduatesTrack');
    var gradSlides = gradTrack ? gradTrack.querySelectorAll('.graduate-slide') : [];
    var gradTotal = gradSlides.length;
    var gradDotsContainer = document.getElementById('graduatesDots');
    var gradProgress = document.getElementById('graduatesProgress');
    var gradCurrentNum = document.getElementById('currentSlideNum');
    var gradTotalNum = document.getElementById('totalSlidesNum');
    var gradAutoInterval;
    var gradAutoDelay = 6000;

    // ✅ تعيين العدد الإجمالي
    if (gradTotalNum) gradTotalNum.textContent = gradTotal;

    // ✅ إنشاء النقاط
    function createGradDots() {
        if (!gradDotsContainer) return;
        gradDotsContainer.innerHTML = '';
        for (var i = 0; i < gradTotal; i++) {
            var dot = document.createElement('span');
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('data-index', i);
            dot.setAttribute('aria-label', 'الخريج ' + (i + 1));
            dot.addEventListener('click', function() {
                goToGradSlide(parseInt(this.getAttribute('data-index')));
                resetGradAuto();
            });
            gradDotsContainer.appendChild(dot);
        }
    }

    // ✅ الدالة المُصلحة - تستخدم active class بدلاً من transform
    function goToGradSlide(index) {
        if (index < 0) index = gradTotal - 1;
        else if (index >= gradTotal) index = 0;
        
        gradCurrent = index;
        
        // ✅ إخفاء جميع الشرائح وإظهار الشريحة النشطة فقط
        gradSlides.forEach(function(slide, i) {
            if (i === gradCurrent) {
                slide.classList.add('active');
                slide.style.opacity = '1';
                slide.style.visibility = 'visible';
                slide.style.position = 'relative';
                slide.style.display = 'block';
            } else {
                slide.classList.remove('active');
                slide.style.opacity = '0';
                slide.style.visibility = 'hidden';
                slide.style.position = 'absolute';
                slide.style.display = 'none';
            }
        });
        
        // تحديث النقاط
        document.querySelectorAll('.slider-dot').forEach(function(d, i) {
            d.classList.toggle('active', i === gradCurrent);
        });
        
        // تحديث شريط التقدم
        if (gradProgress) {
            gradProgress.style.width = ((gradCurrent + 1) / gradTotal * 100) + '%';
        }
        
        // تحديث العداد
        if (gradCurrentNum) gradCurrentNum.textContent = gradCurrent + 1;
    }

    function moveGraduateSlide(direction) {
        goToGradSlide(gradCurrent + direction);
        resetGradAuto();
    }

    function startGradAuto() {
        stopGradAuto();
        gradAutoInterval = setInterval(function() {
            goToGradSlide(gradCurrent + 1);
        }, gradAutoDelay);
    }

    function stopGradAuto() {
        if (gradAutoInterval) clearInterval(gradAutoInterval);
    }

    function resetGradAuto() {
        stopGradAuto();
        startGradAuto();
    }

    // تعريف الدوال في النطاق العام
    window.goToGradSlide = goToGradSlide;
    window.moveGraduateSlide = moveGraduateSlide;
    window.resetGradAuto = resetGradAuto;

    // ✅ ربط أزرار السابق والتالي
    var gradPrevBtn = document.getElementById('gradPrevBtn');
    var gradNextBtn = document.getElementById('gradNextBtn');
    
    if (gradPrevBtn) {
        gradPrevBtn.addEventListener('click', function() {
            moveGraduateSlide(-1);
        });
    }
    if (gradNextBtn) {
        gradNextBtn.addEventListener('click', function() {
            moveGraduateSlide(1);
        });
    }

    // ✅ التهيئة الأولية
    createGradDots();
    
    // ✅ إعداد الشرائح للعرض الأولي
    gradSlides.forEach(function(slide, i) {
        if (i === 0) {
            slide.classList.add('active');
            slide.style.opacity = '1';
            slide.style.visibility = 'visible';
            slide.style.position = 'relative';
            slide.style.display = 'block';
        } else {
            slide.classList.remove('active');
            slide.style.opacity = '0';
            slide.style.visibility = 'hidden';
            slide.style.position = 'absolute';
            slide.style.display = 'none';
        }
    });
    
    if (gradTotal > 0) {
        goToGradSlide(0);
        startGradAuto();
    }

    // ✅ التحكم بالماوس
    var sliderContainer = document.querySelector('.graduates-slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopGradAuto);
        sliderContainer.addEventListener('mouseleave', startGradAuto);
    }

    // ✅ دعم اللمس (Touch)
    var touchStartX = 0;
    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            stopGradAuto();
        }, {passive: true});
        
        sliderContainer.addEventListener('touchend', function(e) {
            var diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                goToGradSlide(diff > 0 ? gradCurrent + 1 : gradCurrent - 1);
            }
            startGradAuto();
        }, {passive: true});
    }

    // ✅ دعم لوحة المفاتيح
    document.addEventListener('keydown', function(e) {
        var gradSection = document.getElementById('graduates');
        if (gradSection) {
            var rect = gradSection.getBoundingClientRect();
            var isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                if (e.key === 'ArrowLeft') { 
                    goToGradSlide(gradCurrent + 1); 
                    resetGradAuto(); 
                }
                else if (e.key === 'ArrowRight') { 
                    goToGradSlide(gradCurrent - 1); 
                    resetGradAuto(); 
                }
            }
        }
    });

    // ==================== Tabs ====================
    function switchTab(tabName, clickedBtn) {
        document.querySelectorAll('.tab-content').forEach(function(c) { 
            c.classList.remove('active'); 
            c.setAttribute('hidden', 'true');
        });
        document.querySelectorAll('.tab-btn').forEach(function(b) { 
            b.classList.remove('active'); 
            b.setAttribute('aria-selected', 'false');
        });
        
        var tabContent = document.getElementById('tab-' + tabName);
        if (tabContent) {
            tabContent.classList.add('active');
            tabContent.removeAttribute('hidden');
        }
        
        if (clickedBtn) {
            clickedBtn.classList.add('active');
            clickedBtn.setAttribute('aria-selected', 'true');
        }
    }

    window.switchTab = switchTab;

    // ربط أزرار التبويب تلقائياً
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var controls = this.getAttribute('aria-controls');
            if (controls) {
                var tabName = controls.replace('tab-', '');
                switchTab(tabName, this);
            }
        });
    });

    // ==================== Lightbox ====================
    window.openLightbox = function(src) {
        var lightbox = document.getElementById('lightbox');
        var lightboxImg = document.getElementById('lightboxImg');
        if (lightbox && lightboxImg) {
            lightboxImg.src = src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeLightbox = function() {
        var lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // ربط معرض الصور
    document.querySelectorAll('.gallery-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var imgSrc = this.getAttribute('data-img');
            if (imgSrc) openLightbox(imgSrc);
        });
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                var imgSrc = this.getAttribute('data-img');
                if (imgSrc) openLightbox(imgSrc);
            }
        });
    });

    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox').addEventListener('click', function(e) {
        if (e.target === this) closeLightbox();
    });

    // ==================== Form Submit ====================
    var interestForm = document.getElementById('interestForm');
    var formSuccess = document.getElementById('formSuccess');
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        var fullName = document.getElementById('fullName');
        var phone = document.getElementById('phone');
        var email = document.getElementById('email');
        var programSelect = document.getElementById('program');
        
        var name = fullName ? fullName.value.trim() : '';
        var phoneVal = phone ? phone.value.trim() : '';
        var emailVal = email ? email.value.trim() : '';
        var program = programSelect ? programSelect.options[programSelect.selectedIndex].text : '';
        var programValue = programSelect ? programSelect.value : '';
        
        if (!name || !phoneVal || !programValue) {
            alert('الرجاء تعبئة جميع الحقول المطلوبة');
            return false;
        }
        
        var waMessage = 'طلب تسجيل جديد 🎓%0A%0A' +
                       '📝 الاسم: ' + encodeURIComponent(name) + 
                       '%0A📞 الهاتف: ' + encodeURIComponent(phoneVal) + 
                       '%0A📧 البريد: ' + encodeURIComponent(emailVal || 'غير محدد') + 
                       '%0A🎯 التخصص: ' + encodeURIComponent(program) + 
                       '%0A📍 الفرع: إب';
        
        window.open('https://wa.me/967777416883?text=' + waMessage, '_blank');
        
        var mailSubject = 'طلب تسجيل جديد - ' + name;
        var mailBody = 'الاسم: ' + name + '%0A' +
                      'الهاتف: ' + phoneVal + '%0A' +
                      'البريد: ' + (emailVal || 'غير محدد') + '%0A' +
                      'البرنامج: ' + program + '%0A' +
                      'الفرع: إب';
        
        setTimeout(function() {
            window.open('mailto:alshabibi1968@gmail.com?subject=' + encodeURIComponent(mailSubject) + '&body=' + mailBody, '_blank');
        }, 500);
        
        if (interestForm) interestForm.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('show');
        
        setTimeout(function() {
            if (interestForm) { 
                interestForm.reset(); 
                interestForm.style.display = 'block'; 
            }
            if (formSuccess) formSuccess.classList.remove('show');
        }, 5000);
        
        return false;
    }
    
    if (interestForm) {
        interestForm.addEventListener('submit', handleFormSubmit);
    }

    // ==================== Job Simulator ====================
    var simStep = 0;
    var simAnswers = [0, 0, 0, 0];
    var simQuestions = [
        {
            question: 'ما هو أكثر مجال يثير اهتمامك في العمل الصحي؟',
            options: [
                {text: 'إدارة الفرق والموارد البشرية', icon: 'fa-users', scores: [2,0,0,0]},
                {text: 'تحليل البيانات واتخاذ القرارات', icon: 'fa-chart-line', scores: [0,2,0,0]},
                {text: 'تطبيق معايير الجودة والسلامة', icon: 'fa-shield-alt', scores: [0,0,2,0]},
                {text: 'التكنولوجيا والمعلوماتية الصحية', icon: 'fa-laptop-code', scores: [0,0,0,2]}
            ]
        },
        {
            question: 'ما البيئة التي تفضل العمل فيها؟',
            options: [
                {text: 'مستشفى كبير مزدحم', icon: 'fa-hospital', scores: [1,0,1,0]},
                {text: 'مركز أبحاث وتحليل', icon: 'fa-flask', scores: [0,1,0,1]},
                {text: 'شركة استشارات إدارية', icon: 'fa-briefcase', scores: [1,0,0,1]},
                {text: 'منظمة دولية', icon: 'fa-globe', scores: [0,1,1,0]}
            ]
        },
        {
            question: 'أي المهارات تشعر أنها الأقوى لديك؟',
            options: [
                {text: 'القيادة والتأثير في الآخرين', icon: 'fa-crown', scores: [2,0,0,0]},
                {text: 'حل المشكلات والتحليل المنطقي', icon: 'fa-puzzle-piece', scores: [0,2,0,0]},
                {text: 'الدقة والانتباه للتفاصيل', icon: 'fa-search', scores: [0,0,2,0]},
                {text: 'سرعة التعلم والتكيف مع التقنيات', icon: 'fa-bolt', scores: [0,0,0,2]}
            ]
        }
    ];
    
    var simResults = [
        { title: 'مدير موارد بشرية صحية', icon: '👥', desc: 'أنت شخص قيادي بطبعك، تهتم بالعلاقات الإنسانية وتطوير أداء الفرق. العمل في إدارة الموارد البشرية في القطاع الصحي سيمنحك الفرصة لبناء بيئة عمل إيجابية وتحقيق النجاح المؤسسي.' },
        { title: 'محلل نظم صحية', icon: '📊', desc: 'لديك عقلية تحليلية قوية وتحب التعامل مع الأرقام والبيانات. تخصصك المثالي هو تحليل النظم الصحية واتخاذ القرارات المبنية على البيانات لتحسين الأداء المؤسسي.' },
        { title: 'مدير جودة صحية', icon: '🛡️', desc: 'أنت شخص دقيق ومنظم وتهتم بأدق التفاصيل. العمل في إدارة الجودة الصحية سيمكنك من تطبيق المعايير العالمية وضمان سلامة المرضى.' },
        { title: 'مدير معلوماتية صحية', icon: '💻', desc: 'أنت شغوف بالتكنولوجيا وتحب استكشاف أحدث الابتكارات. العمل في المعلوماتية الصحية سيمكنك من قيادة التحول الرقمي في المؤسسات الصحية.' }
    ];

    function updateSimQuestion() {
        var q = simQuestions[simStep];
        var simQuestionEl = document.getElementById('simQuestion');
        var simOptionsEl = document.getElementById('simOptions');
        
        if (simQuestionEl) simQuestionEl.textContent = q.question;
        
        if (simOptionsEl) {
            var html = '';
            q.options.forEach(function(opt, idx) {
                html += '<button type="button" class="sim-option" onclick="window.simAnswer(' + idx + ')">' +
                        '<i class="fas ' + opt.icon + '"></i> ' + opt.text + 
                        '</button>';
            });
            simOptionsEl.innerHTML = html;
        }
        
        document.querySelectorAll('.sim-dot').forEach(function(dot, i) {
            dot.classList.toggle('active', i <= simStep);
        });
    }

    window.simAnswer = function(optionIndex) {
        var scores = simQuestions[simStep].options[optionIndex].scores;
        for (var i = 0; i < scores.length; i++) {
            simAnswers[i] += scores[i];
        }
        
        var opts = document.querySelectorAll('.sim-option');
        opts.forEach(function(btn, idx) {
            btn.classList.toggle('selected', idx === optionIndex);
        });
        
        setTimeout(function() {
            simStep++;
            if (simStep < simQuestions.length) {
                updateSimQuestion();
            } else {
                showSimResult();
            }
        }, 400);
    };

    function showSimResult() {
        var maxIdx = 0, maxVal = 0;
        for (var i = 0; i < simAnswers.length; i++) {
            if (simAnswers[i] > maxVal) {
                maxVal = simAnswers[i];
                maxIdx = i;
            }
        }
        
        var result = simResults[maxIdx];
        var resIcon = document.getElementById('resIcon');
        var resTitle = document.getElementById('resTitle');
        var resDesc = document.getElementById('resDesc');
        var simQuiz = document.getElementById('simulatorQuiz');
        var simResult = document.getElementById('simResult');
        
        if (resIcon) resIcon.textContent = result.icon;
        if (resTitle) resTitle.textContent = result.title;
        if (resDesc) resDesc.textContent = result.desc;
        if (simQuiz) simQuiz.style.display = 'none';
        if (simResult) simResult.classList.add('show');
    }

    window.simReset = function() {
        simStep = 0;
        simAnswers = [0, 0, 0, 0];
        var simQuiz = document.getElementById('simulatorQuiz');
        var simResult = document.getElementById('simResult');
        
        if (simQuiz) simQuiz.style.display = 'block';
        if (simResult) simResult.classList.remove('show');
        
        document.querySelectorAll('.sim-dot').forEach(function(dot, i) {
            dot.classList.toggle('active', i === 0);
        });
        updateSimQuestion();
    };

    // ربط زر إعادة الاختبار
    var simResetBtn = document.getElementById('simResetBtn');
    if (simResetBtn) {
        simResetBtn.addEventListener('click', window.simReset);
    }

    updateSimQuestion();

    // ==================== Scroll Reveal ====================
    var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var delay = parseInt(entry.target.dataset.revealDelay || 0);
                setTimeout(function() {
                    entry.target.classList.add('active');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(function(el, index) {
        el.dataset.revealDelay = (index % 4) * 100;
        revealObserver.observe(el);
    });

    // ==================== Smooth Scroll ====================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                var target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ==================== Active Nav Link ====================
    var sections = document.querySelectorAll('section[id], header[id]');
    var navLinksAll = document.querySelectorAll('.side-nav-links a:not(.register-link)');
    
    function updateActiveNav() {
        var current = '';
        sections.forEach(function(section) {
            if (window.scrollY >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });
        navLinksAll.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', debounce(updateActiveNav, 100));

    // ==================== Particles ====================
    function createParticles() {
        var space = document.getElementById('space-bg');
        if (!space) return;
        var colors = ['rgba(0,255,150,0.4)', 'rgba(200,148,10,0.4)', 'rgba(255,255,255,0.3)'];
        
        for (var i = 0; i < 20; i++) {
            var p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.width = p.style.height = (Math.random() * 4 + 1) + 'px';
            p.style.background = colors[i % 3];
            p.style.animationDuration = (Math.random() * 15 + 10) + 's';
            p.style.animationDelay = Math.random() * 10 + 's';
            space.appendChild(p);
        }
    }
    createParticles();

    // ==================== Year Update ====================
    var yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // ==================== Image Error Handling ====================
    document.querySelectorAll('img').forEach(function(img) {
        img.addEventListener('error', function() {
            if (!this.src.includes('placehold.co')) {
                this.src = 'https://placehold.co/400x400/0d4a2e/gold?text=NIAS';
            }
        });
    });

    // ==================== Console Welcome ====================
    console.log('%c🏥 المعهد الوطني للعلوم الإدارية - فرع إب', 'color: #0d4a2e; font-size: 22px; font-weight: bold;');
    console.log('%c🎓 بكالوريوس إدارة المستشفيات والخدمات الصحية', 'color: #c8a415; font-size: 16px;');
    console.log('%c📅 العام الدراسي 2026-2027', 'color: #7cb342; font-size: 14px;');
    console.log('%c📍 إب - الجمهورية اليمنية', 'color: #666; font-size: 12px;');

});

// ==================== Utility Functions ====================
function debounce(func, wait) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}

// ==================== Global Event Handlers ====================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        var lightbox = document.getElementById('lightbox');
        if (lightbox && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
        var sideNav = document.getElementById('sideNav');
        var sideNavOverlay = document.getElementById('sideNavOverlay');
        if (sideNav && sideNav.classList.contains('open')) {
            sideNav.classList.remove('open');
            sideNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

var resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        if (window.innerWidth > 1024) {
            var sideNav = document.getElementById('sideNav');
            var sideNavOverlay = document.getElementById('sideNavOverlay');
            if (sideNav) sideNav.classList.remove('open');
            if (sideNavOverlay) sideNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }, 250);
});

