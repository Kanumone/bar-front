import { useEffect } from "react";
import { useMoveSceneStore } from "@core/state/move-scene-store";
import { getAssetsPath } from "$utils";
import { QuizOverlay } from "$/features/game-quiz/components/quiz-overlay";
import { GameScene, type MoveScene, type QuizItem } from "@core/types/common-types";
import { useBackgroundMusic } from "$/core/hooks/use-background-music/use-music";
import { useSceneStore } from "$core/state";

interface MoveParams {
    backgroundMusicPath: string;
    questionsPath: string;
}

const params: Partial<Record<MoveScene, MoveParams>> = {
    [GameScene.MoveToTrain]: {
        backgroundMusicPath: "Звук утреннего города.mp3",
        questionsPath: "move-to-train.json",
    },
    [GameScene.MoveAfterTrain]: {
        backgroundMusicPath: "Звук утреннего города.mp3",
        questionsPath: "move-after-train.json",
    },
    [GameScene.MoveToVdnh]: {
        backgroundMusicPath: "Звук утреннего города.mp3",
        questionsPath: "move-to-vdnh.json",
    },
    [GameScene.MoveToGallery]: {
        backgroundMusicPath: "Звук утреннего города.mp3",
        questionsPath: "move-to-gallery.json",
    },
    [GameScene.MoveToKazan]: {
        backgroundMusicPath: "Звук утреннего города.mp3",
        questionsPath: "move-to-kazan.json",
    },
    [GameScene.MoveInKazan]: {
        backgroundMusicPath: "Звук утреннего города.mp3",
        questionsPath: "move-to-kazan-quiz.json",
    },
    [GameScene.MoveInKazanVillage]: {
        backgroundMusicPath: "Звук утреннего города.mp3",
        questionsPath: "move-to-kazan-village.json",
    },
    
}

export const MoveWrapper = () => {
    const {
        questions,
        currentIndex,
        isQuizVisible,
        stage,
        selected,
        setQuestions,
        startQuizCycle,
        skipIntro,
        answerQuestion,
    } = useMoveSceneStore();

    const scene = useSceneStore.getState().currentScene as MoveScene;

    const sceneParams = params[scene];

    useBackgroundMusic({
        scene,
        filename: sceneParams?.backgroundMusicPath || ""
    });

    useEffect(() => {
        // Если для сцены нет пути к вопросам — сбросить состояние и ничего не запускать
        if (!sceneParams?.questionsPath) {
            setQuestions([]);
            return;
        }

        fetch(getAssetsPath(`data/${sceneParams.questionsPath}`))
            .then((res) => (res.json()))
            .then(({ questions }: { questions: QuizItem[] }) => {
                setQuestions(questions);
                if (questions.length) {
                    startQuizCycle();
                }
            })
            .catch((error) => {
                console.error("Error loading questions", error);
                // При ошибке загрузки очищаем состояние, чтобы не остались старые вопросы/флаги
                setQuestions([]);
            });
    }, [setQuestions, startQuizCycle, scene]);

    if (!questions.length) return null;

    return (
        <>
            {isQuizVisible && (
                <QuizOverlay
                    question={questions[currentIndex]}
                    stage={stage}
                    selected={selected}
                    onSkipIntro={skipIntro}
                    onAnswer={answerQuestion}
                />
            )}
        </>
    );
};
