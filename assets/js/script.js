/* ==========================================================================
   ROBUST MULTI-PAGE INTERACTIVE LOGIC & ANIMATIONS
   Project: Digital Portfolio - Trần Quốc Khánh (25020220)
   ========================================================================== */

(function() {
    "use strict";

    function init() {
        // Add js-enabled class to activate reveal animations in CSS
        document.documentElement.classList.add("js-enabled");

        // ==========================================================================
        // 1. DUAL-THEME STORAGE & URL QUERY PROPAGATION (BULLETPROOF SYNC)
        // ==========================================================================
        const themeToggle = document.getElementById("theme-toggle");
        const themeIcon = document.getElementById("theme-icon");
        
        let currentTheme = "dark"; // Default theme
        
        // Step A: Read theme from URL query param first (high priority for sandbox sync)
        const urlParams = new URLSearchParams(window.location.search);
        const urlTheme = urlParams.get("theme");
        
        if (urlTheme === "light" || urlTheme === "dark") {
            currentTheme = urlTheme;
        } else {
            // Step B: Fallback to localStorage if no URL parameter is provided
            try {
                const storedTheme = localStorage.getItem("theme");
                if (storedTheme === "light" || storedTheme === "dark") {
                    currentTheme = storedTheme;
                }
            } catch (e) {
                console.warn("Storage reading blocked, falling back to default theme:", e);
            }
        }
        
        // Step C: Apply theme to root element
        document.documentElement.setAttribute("data-theme", currentTheme);
        updateThemeIcon(currentTheme);
        propagateThemeToLinks(currentTheme);
        
        // Theme Toggle Click Handler
        if (themeToggle) {
            themeToggle.addEventListener("click", () => {
                let theme = (document.documentElement.getAttribute("data-theme") || "dark").trim();
                let newTheme = theme === "dark" ? "light" : "dark";
                console.log(`Toggling theme from ${theme} to ${newTheme}`);
                
                // Update DOM attribute
                document.documentElement.setAttribute("data-theme", newTheme);
                updateThemeIcon(newTheme);
                
                // Try to write to localStorage safely
                try {
                    localStorage.setItem("theme", newTheme);
                } catch (e) {
                    console.warn("Storage writing blocked:", e);
                }
                
                // Rewrite all links on page to propagate new theme query param
                propagateThemeToLinks(newTheme);
                
                // Update current page URL history dynamically so refresh/copy works
                try {
                    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?theme=${newTheme}${window.location.hash}`;
                    window.history.replaceState({ path: newUrl }, "", newUrl);
                } catch (e) {
                    console.warn("History replaceState blocked:", e);
                }
            });
        }
        
        function updateThemeIcon(theme) {
            if (!themeIcon) return;
            if (theme === "light") {
                themeIcon.className = "ph-light ph-moon";
            } else {
                themeIcon.className = "ph-light ph-sun-dim";
            }
        }

        // Dynamically append ?theme=... parameter to all internal site links
        function propagateThemeToLinks(theme) {
            const links = document.querySelectorAll("a");
            links.forEach(link => {
                const href = link.getAttribute("href");
                if (href) {
                    const cleanHref = href.trim();
                    // Identify if link targets our internal pages
                    if (cleanHref.startsWith("index.html") || cleanHref.startsWith("exercises.html") || cleanHref.startsWith("summary.html")) {
                        const baseUrl = cleanHref.split("?")[0].split("#")[0];
                        const hashPart = cleanHref.includes("#") ? `#${cleanHref.split("#")[1]}` : "";
                        link.setAttribute("href", `${baseUrl}?theme=${theme}${hashPart}`);
                    }
                    // For mobile nav bars
                    if (link.classList.contains("mobile-nav-link")) {
                        const baseUrl = cleanHref.split("?")[0];
                        link.setAttribute("href", `${baseUrl}?theme=${theme}`);
                    }
                }
            });
        }

        // ==========================================================================
        // 2. SCROLL ENTRY ANIMATIONS (IntersectionObserver with fallback)
        // ==========================================================================
        const revealElements = document.querySelectorAll(".reveal");
        
        if ('IntersectionObserver' in window && revealElements.length > 0) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.01,
                rootMargin: "0px 0px -10px 0px"
            });
            revealElements.forEach(el => revealObserver.observe(el));
        } else {
            // Fallback: make everything visible immediately if observer isn't supported
            revealElements.forEach(el => el.classList.add("visible"));
        }

        // ==========================================================================
        // 3. EXERCISES PAGE: STICKY SIDEBAR SCROLL SPY
        // ==========================================================================
        const exerciseBlocks = document.querySelectorAll(".exercise-block");
        const sidebarLinks = document.querySelectorAll(".sidebar-link");
        
        let isProgrammaticScroll = false;
        let scrollTimeout;

        if (exerciseBlocks.length > 0 && sidebarLinks.length > 0 && 'IntersectionObserver' in window) {
            const sectionObserver = new IntersectionObserver((entries) => {
                if (isProgrammaticScroll) return; // Ignore observer during active clicks
                
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute("id");
                        sidebarLinks.forEach(link => {
                            const linkHref = link.getAttribute("href");
                            if (linkHref && linkHref.endsWith(`#${id}`)) {
                                link.classList.add("active");
                            } else {
                                link.classList.remove("active");
                            }
                        });
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: "-15% 0px -60% 0px" // Targets the middle upper viewport area
            });
            
            exerciseBlocks.forEach(block => sectionObserver.observe(block));
            
            // Smoothen click anchor navigation on sidebar
            sidebarLinks.forEach(link => {
                link.addEventListener("click", (e) => {
                    const href = link.getAttribute("href");
                    if (href && href.includes("#")) {
                        e.preventDefault();
                        const targetId = href.split("#")[1];
                        const targetEl = document.getElementById(targetId);
                        if (targetEl) {
                            isProgrammaticScroll = true;
                            clearTimeout(scrollTimeout);

                            // Instantly highlight clicked link
                            sidebarLinks.forEach(l => l.classList.remove("active"));
                            link.classList.add("active");

                            const yOffset = -90; // Offset navbar height
                            const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({top: y, behavior: 'smooth'});
                            
                            // Dynamically update hash in url with theme parameter
                            try {
                                const theme = document.documentElement.getAttribute("data-theme");
                                const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?theme=${theme}#${targetId}`;
                                window.history.pushState({ path: newUrl }, "", newUrl);
                            } catch (err) {
                                console.warn("History pushState blocked:", err);
                            }

                            // Reset flag after smooth scroll completes
                            scrollTimeout = setTimeout(() => {
                                isProgrammaticScroll = false;
                            }, 800);
                        }
                    }
                });
            });

            // Scroll listener fallback for the absolute bottom of page
            window.addEventListener("scroll", () => {
                if (isProgrammaticScroll) return;
                const isAtBottom = (window.innerHeight + window.pageYOffset) >= document.documentElement.scrollHeight - 50;
                if (isAtBottom) {
                    sidebarLinks.forEach(link => {
                        const linkHref = link.getAttribute("href");
                        if (linkHref && linkHref.endsWith("#downloads")) {
                            link.classList.add("active");
                        } else {
                            link.classList.remove("active");
                        }
                    });
                }
            });
        }

        // ==========================================================================
        // 4. PROMPT ENGINEERING DYNAMIC DICTIONARY (WEEK 3)
        // ==========================================================================
        const promptData = {
            task1: {
                basic: {
                    prompt: `Tóm tắt bài báo "Computing the Shortest Path: A* Search Meets Graph Theory" của Andrew V. Goldberg.`,
                    output: `Bài báo này của Microsoft Research nghiên cứu về việc tính toán đường đi ngắn nhất trên đồ thị lớn bằng thuật toán A*. Nhóm nghiên cứu đề xuất một thuật toán cải tiến mới giúp tìm đường nhanh hơn và hiệu quả hơn so với thuật toán cũ.`,
                    analysis: `Không cung cấp vai trò, mục tiêu cụ thể hay ràng buộc ngữ cảnh. AI đưa ra kết quả rất chung chung, mang tính khái quát bề nổi, thiếu hoàn toàn thông tin về giải thuật cốt lõi (ALT), mốc (Landmarks) hay bất đẳng thức tam giác.`
                },
                improved: {
                    prompt: `Hãy tóm tắt nội dung cốt lõi, phương pháp nghiên cứu và kết luận của bài báo "Computing the Shortest Path: A* Search Meets Graph Theory" của Andrew V. Goldberg. Phân tích cụ thể cách thuật toán A* kết hợp với Graph Theory.`,
                    output: `Bài báo đề xuất thuật toán ALT - kết hợp thuật toán tìm đường A* với lý thuyết đồ thị thông qua các điểm mốc (Landmarks) và bất đẳng thức tam giác để tính toán heuristic tốt hơn.\nPhương pháp nghiên cứu gồm tiền xử lý đồ thị để tính khoảng cách đến các Landmarks, sau đó dùng Heuristic để truy vấn nhanh. Kết luận chỉ ra tốc độ truy vấn tăng đáng kể.`,
                    analysis: `Cấu trúc đầu ra tốt hơn nhờ yêu cầu rõ ràng các mục tóm tắt. Tuy nhiên, phần giải thích cơ chế kỹ thuật toán học (bất đẳng thức tam giác hoạt động như thế nào để tối ưu Heuristic) vẫn còn khá mơ hồ và chưa sâu sắc.`
                },
                advanced: {
                    prompt: `Đóng vai một Giáo sư Khoa học Máy tính chuyên giảng dạy về Cấu trúc Dữ liệu và Giải thuật. Hãy tóm tắt bài báo "Computing the Shortest Path: A* Search Meets Graph Theory" của Andrew V. Goldberg et al.\n\nThực hiện theo các bước tư duy sau:\n1. Xác định nút thắt (bottleneck) của thuật toán Dijkstra và A* truyền thống trên đồ thị cực lớn.\n2. Giải thích cơ chế cốt lõi của thuật toán ALT (A* search, Landmarks, Triangle inequality). Bất đẳng thức tam giác đã được sử dụng để tối ưu hóa hàm heuristic như thế nào?\n3. Đánh giá sự đánh đổi (trade-off) giữa chi phí tiền xử lý (preprocessing) và tốc độ truy vấn.\n\nTrình bày dưới dạng Bullet points, sử dụng ngôn ngữ học thuật chuyên sâu nhưng mạch lạc.`,
                    output: `• Bottleneck: Thuật toán Dijkstra duyệt đồ thị mù quáng theo mọi hướng nên tốn bộ nhớ. A* truyền thống khắc phục bằng hàm heuristic định hướng, nhưng trên đồ thị khổng lồ (như bản đồ đường bộ quốc gia), việc thiết kế một heuristic đủ mạnh mà vẫn bảo đảm tính Admissible là vô cùng khó khăn.\n\n• Cơ chế thuật toán ALT (Landmarks & Triangle Inequality):\n- Chọn trước một số đỉnh mốc L (Landmarks) trên đồ thị.\n- Tính toán và lưu trữ trước khoảng cách d(u, L) từ mọi đỉnh u đến L.\n- Trong pha truy vấn tìm đường từ u đến đích v, áp dụng bất đẳng thức tam giác: d(u, v) >= d(u, L) - d(v, L) và d(u, v) >= d(v, L) - d(u, L). Từ đó suy ra heuristic tối ưu: h(u) = max_{L} |d(u, L) - d(v, L)|.\n- Heuristic này đảm bảo cả hai thuộc tính Admissible và Consistent, giúp thu hẹp đáng kể số lượng node cần duyệt mà không làm mất tính tối ưu của đường đi.\n\n• Phân tích Trade-off:\n- Pha tiền xử lý (Preprocessing): Đòi hỏi chi phí tính toán lớn và không gian lưu trữ bổ sung để chứa ma trận khoảng cách đến các Landmarks.\n- Pha truy vấn (Query): Tốc độ tìm kiếm được tối ưu hóa cực đại (nhanh hơn hàng chục đến hàng trăm lần), phù hợp cho các tác vụ thời gian thực như hệ thống định vị GPS.`,
                    analysis: `Ứng dụng thành thạo **Role Prompting**, **Chain-of-Thought (Tư duy từng bước)** và **Ràng buộc định dạng**. Ép mô hình AI lọc các trọng số từ vựng chuyên ngành sâu sắc, đưa ra lý giải toán học chính xác và logic phản biện chặt chẽ.`
                }
            },
            task2: {
                basic: {
                    prompt: `Giải thích khái niệm Tối ưu hóa heuristic.`,
                    output: `Tối ưu hóa heuristic là phương pháp thiết kế các quy tắc hoặc hàm đánh giá để giúp thuật toán tìm kiếm giải pháp nhanh hơn. Nó không bảo đảm tìm ra giải pháp tốt nhất nhưng giúp tiết kiệm thời gian tính toán.`,
                    analysis: `Đưa ra định nghĩa từ điển học thuật khô khan, thiếu ví dụ thực tế nên rất khó tiếp thu đối với sinh viên mới bắt đầu học giải thuật.`
                },
                improved: {
                    prompt: `Giải thích khái niệm Tối ưu hóa heuristic trong thuật toán tìm đường (như A*). Lấy một ví dụ minh họa để làm rõ tại sao nó lại quan trọng.`,
                    output: `Trong thuật toán tìm đường A*, tối ưu hóa heuristic là việc thiết kế hàm h(n) để ước lượng khoảng cách từ node hiện tại đến đích. Ví dụ, trên bản đồ thành phố, ta có thể dùng khoảng cách đường chim bay làm Heuristic để robot hướng về phía đích. Việc này giúp thuật toán không phải duyệt các hướng ngược lại, tiết kiệm thời gian xử lý.`,
                    analysis: `Thêm ví dụ minh họa trực quan giúp dễ hiểu hơn rất nhiều. Tuy nhiên, câu trả lời vẫn chưa đi sâu vào cơ chế toán học của sự tối ưu (lý giải tính Admissible).`
                },
                advanced: {
                    prompt: `Bạn là một Kỹ sư Hệ thống dày dạn kinh nghiệm đang hướng dẫn một sinh viên năm nhất trường công nghệ. Hãy giải thích khái niệm "Tối ưu hóa heuristic" (Heuristic optimization) trong thuật toán A*.\n\nYêu cầu:\n- Sử dụng phương pháp loại suy (analogy): So sánh hàm heuristic với hệ thống định vị hoặc trực giác của con người khi đi đường.\n- Phải giải thích rõ hai thuộc tính cốt lõi để một heuristic được coi là "tối ưu": Admissible (không ước lượng vượt quá chi phí thực) và Consistent (tính nhất quán).\n- Kết luận bằng việc tại sao tối ưu hóa heuristic lại quyết định ranh giới giữa một đoạn code chạy mất 10 giây và 10 mili-giây.`,
                    output: `Hãy tưởng tượng em đang đi bộ trong một mê cung để đến một tòa nhà cao tầng. Trực giác của em luôn bảo rằng: "Hãy bước về hướng tòa nhà đó". Hàm Heuristic trong A* chính là "trực giác số" đó, giúp thuật toán định hướng thay vì đi mò mẫm khắp nơi.\n\nĐể trực giác này không dẫn em đi sai đường, nó bắt buộc phải thỏa mãn 2 điều kiện:\n1. Tính Admissible (Chấp nhận được): Hàm ước lượng h(n) tuyệt đối không được lớn hơn chi phí đi thực tế. Giống như ước lượng khoảng cách đường chim bay – nó luôn ngắn hơn hoặc bằng quãng đường đi thực tế qua các ngõ ngách. Nếu ước lượng quá lớn, thuật toán sẽ bỏ qua con đường ngắn nhất thật sự.\n2. Tính Consistent (Nhất quán/Đơn điệu): Chi phí ước lượng từ node hiện tại đến đích không được lớn hơn chi phí đi sang node liền kề cộng với chi phí ước lượng từ node liền kề đó đến đích. Điều này đảm bảo rằng khi thuật toán duyệt qua một node, đường đi đến node đó đã là ngắn nhất, không cần tính toán lại.\n\nKết luận: Nếu không tối ưu hóa Heuristic (hoặc thiết kế h(n) = 0), A* sẽ thoái hóa thành Dijkstra tìm kiếm mù quáng, làm chương trình xử lý mất 10 giây trên bản đồ lớn. Nhưng với một Heuristic tối ưu, không gian tìm kiếm được thu hẹp tối đa, ép thời gian chạy xuống dưới 10 mili-giây.`,
                    analysis: `Kết hợp **Role Prompting**, **Phương pháp loại suy (Analogy)** và **Ràng buộc nội dung khắt khe**. Giúp chuyển tải kiến thức toán học trừu tượng thành trực quan sinh động mà không mất đi tính chính xác.`
                }
            },
            task3: {
                basic: {
                    prompt: `Tạo 5 câu hỏi trắc nghiệm về thuật toán A* và kỹ thuật Landmarks.`,
                    output: `1. Thuật toán A* dùng để làm gì?\n2. Hàm heuristic trong A* ký hiệu là gì?\n3. Landmarks là gì?\n4. Bất đẳng thức tam giác là gì?\n5. Thuật toán ALT viết tắt của cụm từ nào?`,
                    analysis: `Các câu hỏi cực kỳ hời hợt, chỉ dừng lại ở mức độ học thuộc lòng định nghĩa thô sơ. Không có đáp án và giải thích đi kèm.`
                },
                improved: {
                    prompt: `Dựa trên bài báo của Andrew V. Goldberg về thuật toán ALT, hãy tạo một bài kiểm tra gồm 5 câu hỏi trắc nghiệm khách quan có 4 đáp án (A, B, C, D). Yêu cầu cung cấp đáp án đúng và giải thích ngắn gọn ở cuối.`,
                    output: `[Bài kiểm tra 5 câu hỏi về thuật toán ALT]\n(Ví dụ câu hỏi):\nCâu 1: Hàm Heuristic trong thuật toán ALT được tính toán dựa trên:\nA) Dijkstra\nB) Landmarks và bất đẳng thức tam giác\nC) Trực giác con người\nD) Trí tuệ nhân tạo học máy\n=> Đáp án đúng: B. Giải thích: ALT kết hợp A*, Landmarks và Triangle inequality.`,
                    analysis: `Đã có định dạng đầu ra rõ ràng, tuy nhiên các câu hỏi chỉ dừng lại ở mức độ nhận biết thông thường do thiếu một khung đánh giá sư phạm định hình.`
                },
                advanced: {
                    prompt: `Đóng vai chuyên gia ra đề thi môn Phân tích Thiết kế Thuật toán. Dựa vào nội dung thuật toán ALT (A*, Landmarks, Triangle inequality) của Andrew V. Goldberg, hãy tạo một bài trắc nghiệm 5 câu.\n\nÁp dụng khung phân loại nhận thức Bloom:\n- 2 câu ở mức độ Nhớ (Recall): Hỏi về định nghĩa và thành phần cốt lõi.\n- 2 câu ở mức độ Hiểu (Understand): Đòi hỏi suy luận về vai trò của bất đẳng thức tam giác trong ALT.\n- 1 câu ở mức độ Vận dụng (Apply): Đưa ra một tình huống giả định về số lượng Landmarks hoặc chi phí tiền xử lý để đánh giá trade-off.\n\nĐịnh dạng xuất ra:\n[Câu hỏi]\nA) ... B) ... C) ... D) ...\n=> Đáp án đúng: [X]\n=> Giải thích chi tiết bản chất vấn đề:`,
                    output: `[ĐỀ THI ĐÁNH GIÁ CHUYÊN SÂU - THUẬT TOÁN ALT]\n\n--- CẤP ĐỘ 1: NHỚ (RECALL) ---\n\nCâu 1: Trong thuật toán ALT, thành phần dữ liệu nào được tính toán trước ở pha Preprocessing?\nA) Quỹ đạo di chuyển cuối cùng của mọi cặp đỉnh.\nB) Khoảng cách từ mọi đỉnh đến tập hợp các điểm mốc (Landmarks) đã chọn.\nC) Trọng số thay đổi của các cạnh trong môi trường động.\nD) Toàn bộ hàm heuristic của mọi đỉnh trên đồ thị.\n=> Đáp án đúng: B\n=> Giải thích: Pha tiền xử lý tính toán và lưu trữ khoảng cách d(u, L) từ mọi đỉnh u đến mọi điểm mốc L để làm cơ sở tính Heuristic nhanh trong pha truy vấn.\n\nCâu 2: Ký hiệu của thuật toán ALT đại diện cho sự kết hợp của những yếu tố nào?\nA) Algorithm, Link-analysis, Traversal.\nB) A* Search, Landmarks, Triangle Inequality.\nC) Asymptotic, Limit-bound, Triangulation.\nD) Admissible, Landmark-distance, Tree-structure.\n=> Đáp án đúng: B\n=> Giải thích: ALT viết tắt của A* search, Landmarks, và Triangle inequality (bất đẳng thức tam giác).\n\n--- CẤP ĐỘ 2: HIỂU (UNDERSTAND) ---\n\nCâu 3: Bất đẳng thức tam giác nào sau đây được sử dụng để xây dựng một heuristic dưới hạn dưới (lower bound) hợp lệ cho khoảng cách d(u, v) trong thuật toán ALT?\nA) d(u, v) <= d(u, L) + d(v, L)\nB) d(u, v) >= |d(u, L) - d(v, L)|\nC) d(u, v) >= d(u, L) + d(L, v)\nD) d(u, v) <= |d(u, L) - d(v, L)|\n=> Đáp án đúng: B\n=> Giải thích: Theo bất đẳng thức tam giác, ta luôn có d(u, L) <= d(u, v) + d(v, L) => d(u, v) >= d(u, L) - d(v, L). Tương tự d(u, v) >= d(v, L) - d(u, L). Do đó h(u) = max |d(u, L) - d(v, L)| là một giới hạn dưới hợp lệ (Admissible).\n\nCâu 4: Tại sao hàm Heuristic h(u) = max_{L} |d(u, L) - d(v, L)| trong thuật toán ALT luôn đảm bảo tính nhất quán (Consistent)?\nA) Vì nó dựa trên khoảng cách Euclid trên mặt phẳng.\nB) Vì bất đẳng thức tam giác tự đóng vai trò là một điều kiện ràng buộc biên dịch chuyển chi phí đơn điệu giữa các node kề nhau.\nC) Vì số lượng Landmarks luôn lớn hơn số lượng đỉnh của đồ thị.\nD) Vì khoảng cách đến Landmarks được cập nhật liên tục trong pha truy vấn.\n=> Đáp án đúng: B\n=> Giải thích: Tính chất bất đẳng thức tam giác bảo đảm rằng với mọi cạnh (u, w), hiệu khoảng cách tới Landmark thay đổi không vượt quá trọng số cạnh w(u, w), thỏa mãn điều kiện nhất quán h(u) <= w(u, w) + h(w).\n\n--- CẤP ĐỘ 3: VẬN DỤNG (APPLY) ---\n\nCâu 5: Giả sử em thiết lập một hệ thống dẫn đường bản đồ GPS với 1.000.000 đỉnh. Nếu em tăng số lượng Landmarks được chọn từ 10 điểm lên 100 điểm, hệ quả nào sau đây sẽ xảy ra đối với hệ thống?\nA) Thời gian tiền xử lý giảm, tốc độ truy vấn tăng, bộ nhớ RAM yêu cầu giảm.\nB) Thời gian tiền xử lý tăng, tốc độ truy vấn tăng (duyệt ít node hơn), bộ nhớ RAM yêu cầu tăng gấp 10 lần.\nC) Không ảnh hưởng đến bộ nhớ RAM nhưng làm tăng độ phức tạp thời gian truy vấn lên gấp 10 lần.\nD) Thuật toán sẽ mất đi tính tối ưu do hàm Heuristic đánh giá quá cao khoảng cách thực tế.\n=> Đáp án đúng: B\n=> Giải thích: Tăng số lượng Landmarks giúp ước lượng Heuristic sát với khoảng cách thực tế hơn, do đó thu hẹp không gian tìm kiếm làm pha truy vấn nhanh hơn. Tuy nhiên, chi phí tiền xử lý tăng lên và bộ nhớ lưu trữ khoảng cách d(u, L) tăng tuyến tính theo số lượng Landmark (từ 10 x 1M lên 100 x 1M bản ghi), thể hiện rõ sự đánh đổi Space-Time Tradeoff.`,
                    analysis: `Tích hợp **Khung phân loại nhận thức Bloom** vào prompt để phân tầng câu hỏi khoa học từ cơ bản đến nâng cao. Định dạng đầu ra được kiểm soát chi tiết giúp bộ đề thi có tính ứng dụng sư phạm xuất sắc.`
                }
            }
        };

    let activeTask = "task1";
    let activeLevel = "basic";

    const taskButtons = document.querySelectorAll(".prompt-step-btn");
    const levelButtons = document.querySelectorAll(".prompt-level-btn");
    const promptTextEl = document.getElementById("prompt-text");
    const promptOutputEl = document.getElementById("prompt-output");
    const promptAnalysisEl = document.getElementById("prompt-analysis");

    function updatePromptDisplay() {
        const data = promptData[activeTask][activeLevel];
        if (promptTextEl) promptTextEl.textContent = data.prompt;
        if (promptOutputEl) promptOutputEl.textContent = data.output;
        if (promptAnalysisEl) promptAnalysisEl.innerHTML = `<strong>Bản chất kỹ thuật:</strong> ${data.analysis}`;
    }

    // Initialize prompt view
    if (promptTextEl) {
        updatePromptDisplay();
    }

    taskButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            taskButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeTask = btn.getAttribute("data-task");
            updatePromptDisplay();
        });
    });

    levelButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            levelButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeLevel = btn.getAttribute("data-level");
            updatePromptDisplay();
        });
    });

    // ==========================================================================
    // 5. CODE COMPARISON TOGGLE (WEEK 5)
    // ==========================================================================
    const compareButtons = document.querySelectorAll(".code-compare-btn");
    const codePanels = document.querySelectorAll(".code-panel");
    const notePanels = document.querySelectorAll(".code-analysis-note");
    
    compareButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-compare");
            
            // Toggle buttons class
            compareButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            // Toggle code panels based on matching IDs
            codePanels.forEach(panel => {
                if (panel.id === `code-${target}`) {
                    panel.classList.add("active");
                } else {
                    panel.classList.remove("active");
                }
            });
            
            // Toggle notes based on matching IDs
            notePanels.forEach(note => {
                if (note.id === `note-${target}`) {
                    note.classList.add("active");
                    note.style.display = "flex";
                } else {
                    note.classList.remove("active");
                    note.style.display = "none";
                }
            });
        });
    });

    // ==========================================================================
    // 6. TRELLO KANBAN CARD INTERACTIVE EXPAND (WEEK 4)
    // ==========================================================================
    const trelloCards = document.querySelectorAll(".trello-card");
    
    const trelloCardDetails = {
        t1: {
            title: "Thiết kế cấu trúc chương trình mẫu JUnit Test",
            desc: "Thiết lập các ca kiểm thử tự động (Unit test) sử dụng framework JUnit để phục vụ kiểm tra tính đúng đắn của giải pháp Java OOP trong bộ tài liệu ôn tập.",
            deadline: "10 Tháng 6, 2026",
            assignee: "Trần Quốc Khánh",
            status: "Cần làm (To do)"
        },
        t2: {
            title: "Viết nội dung phần 3: Generic & Collections",
            desc: "Biên soạn chi tiết lý thuyết về Generic Classes, Methods, so sánh các List, Set, Map trong Java. Bổ sung 3 ví dụ code thực tiễn về tối ưu cấu trúc dữ liệu.",
            deadline: "08 Tháng 6, 2026",
            assignee: "Trần Quốc Khánh",
            status: "Đang làm (Doing)"
        },
        t3: {
            title: "Rà soát và chuẩn hóa định dạng mã nguồn Java",
            desc: "Đọc lại toàn bộ mã nguồn Java trong bộ tài liệu, kiểm tra tính đúng đắn cú pháp, chuẩn hóa thụt lề (indentation) và chèn bình luận chú giải.",
            deadline: "07 Tháng 6, 2026",
            assignee: "Trần Quốc Khánh",
            status: "Kiểm tra (Review)"
        },
        t4: {
            title: "Thiết lập thư mục chia sẻ Google Drive & Phân quyền",
            desc: "Khởi tạo cấu trúc thư mục dùng chung trên Drive, phân quyền truy cập: Người xem (Viewer) cho giảng viên và Người chỉnh sửa (Editor) cho nhóm.",
            deadline: "Hoàn thành",
            assignee: "Trần Quốc Khánh",
            status: "Đã xong (Done)"
        },
        t5: {
            title: "Biên soạn phần 1: Lập trình hướng đối tượng nâng cao",
            desc: "Biên soạn lý thuyết cốt lõi về Kế thừa (Inheritance), Đa hình (Polymorphism), Đóng gói (Encapsulation), Trừu tượng (Abstraction) và các ví dụ thực hành Java tương ứng.",
            deadline: "Hoàn thành",
            assignee: "Trần Quốc Khánh",
            status: "Đã xong (Done)"
        }
    };
    
    trelloCards.forEach(card => {
        card.addEventListener("click", () => {
            const cardId = card.getAttribute("data-card");
            const details = trelloCardDetails[cardId];
            
            if (details) {
                alert(`📋 CHI TIẾT CÔNG VIỆC TRELLO\n\n📌 Tiêu đề: ${details.title}\n👤 Người làm: ${details.assignee}\n📅 Hạn chót: ${details.deadline}\n⚡ Trạng thái: ${details.status}\n\n📝 Mô tả công việc:\n${details.desc}`);
            }
        });
    });

    // ==========================================================================
    // 7. RESPONSIBLE AI PRINCIPLES DETAIL DRAWER (WEEK 6)
    // ==========================================================================
    const principleCards = document.querySelectorAll(".principle-card");
    const detailPanel = document.getElementById("principle-detail-panel");
    const detailTitle = document.getElementById("principle-detail-title");
    const detailText = document.getElementById("principle-detail-text");
    
    const principleDetails = {
        p1: {
            title: "Nguyên lý 1 - Hiểu Trước Khi Dùng (Comprehension Before Execution)",
            desc: "Tuyệt đối không tích hợp bất kỳ khối mã nguồn hay thuật toán nào do AI sinh ra nếu bản thân người lập trình không thể tự giải thích chi tiết cơ chế hoạt động, luồng dữ liệu, và độ phức tạp tính toán (Time/Space Complexity) của nó. Điều này giúp ngăn ngừa việc tích hợp các lỗi tiềm ẩn nguy hiểm vào hệ thống."
        },
        p2: {
            title: "Nguyên lý 2 - Kiểm Chứng Chéo (Cross-Validation)",
            desc: "Các mô hình ngôn ngữ lớn (LLMs) thường xuyên đưa ra các giải pháp code trông có vẻ hoạt động nhưng lại bỏ qua các lỗi logic nghiệp vụ hoặc các trường hợp biên (edge cases). Quy trình làm việc bắt buộc phải viết các bộ Test Cases thủ công để kiểm chứng chéo hiệu năng thật sự của code do AI sinh ra."
        },
        p3: {
            title: "Nguyên lý 3 - Minh Bạch Mã Nguồn (Transparency in Code)",
            desc: "Xây dựng thói quen ghi nhận trung thực học thuật bằng cách chèn các dòng chú giải (comments) rõ ràng trong mã nguồn chỉ ra những hàm, lớp hay thuật toán nào có sự trợ giúp thiết kế từ AI. Điều này củng cố lòng tin và thể hiện tính chuyên nghiệp trong phát triển phần mềm."
        },
        p4: {
            title: "Nguyên lý 4 - Tuân Thủ Giấy Phép Phần Mềm (License Compliance)",
            desc: "Mã nguồn do AI sinh ra có thể vô tình sao chép nguyên dạng từ các kho mã nguồn mở có giấy phép ràng buộc nghiêm ngặt (như GPL). Người lập trình có trách nhiệm kiểm tra, đối chiếu mã nguồn để bảo đảm không vi phạm bản quyền và tương thích với tiêu chuẩn bản quyền của dự án."
        },
        p5: {
            title: "Nguyên lý 5 - Bảo Mật Dữ Liệu Hệ Thống (Data Security)",
            desc: "Tuyệt đối không bao giờ chia sẻ, nhập các thông tin nhạy cảm của dự án (như API Keys, mật khẩu cơ sở dữ liệu, thông tin cá nhân của người dùng, hoặc mã nguồn độc quyền) lên các công cụ chat AI công cộng để ngăn chặn triệt để nguy cơ rò rỉ dữ liệu hệ thống."
        }
    };
    
    principleCards.forEach(card => {
        card.addEventListener("click", () => {
            const pId = card.getAttribute("data-principle");
            const details = principleDetails[pId];
            
            if (details && detailTitle && detailText && detailPanel) {
                principleCards.forEach(c => c.style.borderColor = "var(--border-color)");
                card.style.borderColor = "var(--accent-blue)";
                detailTitle.textContent = details.title;
                detailText.textContent = details.desc;
                detailPanel.style.display = "block";
                detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });

    // ==========================================================================
    // 8. PRINT TRIGGER (PDF EXPORT)
    // ==========================================================================
    const exportButtons = document.querySelectorAll(".btn-export, #export-pdf-btn");
    exportButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            window.print();
        });
    });
}

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
